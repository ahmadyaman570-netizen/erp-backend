const sequelize = require("../config/database");
const postingService = require("./postingService");
const accountingSettingService = require("./accountingSettingService");

const {
    ReceiptVoucher,
    Customer
} = require("../models");

const createReceiptVoucher = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            customerId,
            voucherNumber,
            date,
            amount,
            paymentMethod,
            checkNumber,
            bankName,
            checkDueDate,
            checkStatus,
            note
        } = data;

        const customer = await Customer.findByPk(customerId, {
            transaction
        });

        if (!customer) {
            throw new Error("Customer not found");
        }

        if (Number(amount) <= 0) {
            throw new Error("Amount must be greater than zero");
        }

        if (!["CASH", "BANK", "CHECK"].includes(paymentMethod)) {
            throw new Error("طريقة الدفع غير صحيحة");
        }
        if (paymentMethod === "CHECK" && !checkNumber) {
            throw new Error("رقم الشيك مطلوب");
        }

        const voucher = await ReceiptVoucher.create(
            {
                customerId,
                voucherNumber,
                date,
                amount,
                paymentMethod,
                checkNumber,
                bankName,
                checkDueDate: checkDueDate || null,
                checkStatus: checkStatus || (paymentMethod === "CHECK" ? "UNDER_COLLECTION" : null),
                note
            },
            { transaction }
        );

        const settings =
            await accountingSettingService.getAccountingSettings();

        const debitAccountId =
            paymentMethod === "CASH"
                ? settings.cashAccountId
                : settings.bankAccountId;

        await postingService.postJournalEntry(
            {
                entryNumber: `RV-${voucher.voucherNumber}`,
                date,
                description: `سند قبض رقم ${voucher.voucherNumber}`,
                lines: [
                    {
                        accountId: debitAccountId,
                        debit: amount,
                        credit: 0
                    },
                    {
                        accountId: customer.accountId || settings.accountsReceivableAccountId,
                        debit: 0,
                        credit: amount
                    }
                ]
            },
            transaction
        );

        await transaction.commit();

        return await getReceiptVoucherById(voucher.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getReceiptVouchers = async () => {
    return await ReceiptVoucher.findAll({
        include: [
            {
                model: Customer,
                attributes: ["id", "name", "accountId"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const getReceiptVoucherById = async (id) => {
    const voucher = await ReceiptVoucher.findByPk(id, {
        include: [
            {
                model: Customer,
                attributes: ["id", "name", "accountId"]
            }
        ]
    });

    if (!voucher) {
        throw new Error("Receipt voucher not found");
    }

    return voucher;
};

module.exports = {
    createReceiptVoucher,
    getReceiptVouchers,
    getReceiptVoucherById
};