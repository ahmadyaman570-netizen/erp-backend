const sequelize = require("../config/database");
const postingService = require("./postingService");
const accountingSettingService = require("./accountingSettingService");

const {
    PaymentVoucher,
    Supplier
} = require("../models");

const createPaymentVoucher = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            supplierId,
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

        const supplier = await Supplier.findByPk(supplierId, {
            transaction
        });

        if (!supplier) {
            throw new Error("Supplier not found");
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

        const voucher = await PaymentVoucher.create(
            {
                supplierId,
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

        const creditAccountId =
            paymentMethod === "CASH"
                ? settings.cashAccountId
                : settings.bankAccountId;

        await postingService.postJournalEntry(
            {
                entryNumber: `PV-${voucher.voucherNumber}`,
                date,
                description: `سند صرف رقم ${voucher.voucherNumber}`,
                lines: [
                    {
                        accountId: supplier.accountId || settings.accountsPayableAccountId,
                        debit: amount,
                        credit: 0
                    },
                    {
                        accountId: creditAccountId,
                        debit: 0,
                        credit: amount
                    }
                ]
            },
            transaction
        );

        await transaction.commit();

        return await getPaymentVoucherById(voucher.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getPaymentVouchers = async () => {
    return await PaymentVoucher.findAll({
        include: [
            {
                model: Supplier,
                attributes: ["id", "name", "accountId"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const getPaymentVoucherById = async (id) => {
    const voucher = await PaymentVoucher.findByPk(id, {
        include: [
            {
                model: Supplier,
                attributes: ["id", "name", "accountId"]
            }
        ]
    });

    if (!voucher) {
        throw new Error("Payment voucher not found");
    }

    return voucher;
};

module.exports = {
    createPaymentVoucher,
    getPaymentVouchers,
    getPaymentVoucherById
};