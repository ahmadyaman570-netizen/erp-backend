const sequelize = require("../config/database");
const postingService = require("./postingService");
const accountingSettingService = require("./accountingSettingService");

const {
    Customer,
    Warehouse,
    Product,
    Inventory,
    InventoryTransaction,
    SalesInvoice,
    SalesInvoiceItem,
    SalesQuotation
} = require("../models");
const salesQuotationService = require("./salesQuotationService");

const createSalesInvoice = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            customerId,
            warehouseId,
            salesQuotationId,
            invoiceNumber,
            date,
            dueDate,
            referenceNumber,
            discountAmount = 0,
            taxAmount = 0,
            notes,
            items
        } = data;

        const customer = await Customer.findByPk(customerId, {
            transaction
        });

        if (!customer) {
            throw new Error("Customer not found");
        }

        const warehouse = await Warehouse.findByPk(warehouseId, {
            transaction
        });

        if (!warehouse) {
            throw new Error("Warehouse not found");
        }

        if (!items || items.length === 0) {
            throw new Error("Invoice items are required");
        }

        let totalAmount = 0;
        let totalCost = 0;

        for (const item of items) {
            const product = await Product.findByPk(item.productId, {
                transaction
            });

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            if (Number(item.quantity) <= 0) {
                throw new Error("Quantity must be greater than zero");
            }

            if (Number(item.unitPrice) <= 0) {
                throw new Error("Unit price must be greater than zero");
            }

            const inventory = await Inventory.findOne({
                where: {
                    productId: item.productId,
                    warehouseId
                },
                transaction
            });

            if (
                !inventory ||
                Number(inventory.quantity) < Number(item.quantity)
            ) {
                throw new Error(
                    `Not enough stock for productId: ${item.productId}`
                );
            }

            const base = Number(item.quantity) * Number(item.unitPrice);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            totalAmount += afterDiscount + itemTaxAmount;

            totalCost +=
                Number(item.quantity) * Number(product.costPrice);
        }

        totalAmount = totalAmount - Number(discountAmount || 0) + Number(taxAmount || 0);

        const invoice = await SalesInvoice.create(
            {
                customerId,
                warehouseId,
                salesQuotationId: salesQuotationId || null,
                invoiceNumber,
                date: date || new Date(),
                dueDate: dueDate || null,
                referenceNumber,
                sourceType: salesQuotationId ? "SALES_QUOTATION" : null,
                sourceId: salesQuotationId || null,
                discountAmount,
                taxAmount,
                totalAmount,
                notes,
                status: "posted"
            },
            { transaction }
        );

        for (const item of items) {
            const base = Number(item.quantity) * Number(item.unitPrice);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            const lineTotal = afterDiscount + itemTaxAmount;

            await SalesInvoiceItem.create(
                {
                    salesInvoiceId: invoice.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    priceBeforeTax: base,
                    discountPercent: Number(item.discountPercent || 0),
                    discountAmount: itemDiscountAmount,
                    taxPercent: Number(item.taxPercent || 0),
                    taxAmount: itemTaxAmount,
                    priceAfterTax: lineTotal,
                    total: lineTotal
                },
                { transaction }
            );

            const inventory = await Inventory.findOne({
                where: {
                    productId: item.productId,
                    warehouseId
                },
                transaction
            });

            await inventory.update(
                {
                    quantity:
                        Number(inventory.quantity) -
                        Number(item.quantity)
                },
                { transaction }
            );

            await InventoryTransaction.create(
                {
                    productId: item.productId,
                    warehouseId,
                    type: "OUT",
                    quantity: item.quantity,
                    note: `فاتورة مبيعات رقم ${invoice.invoiceNumber}`
                },
                { transaction }
            );
        }

        if (salesQuotationId) {
            await salesQuotationService.markSalesQuotationConverted(salesQuotationId, transaction);
        }

        const settings =
            await accountingSettingService.getAccountingSettings();

        await postingService.postJournalEntry(
            {
                entryNumber: `JE-${invoice.invoiceNumber}`,
                date: new Date(),
                description: `فاتورة مبيعات رقم ${invoice.invoiceNumber}`,
                lines: [
                    {
                        accountId: customer.accountId || settings.accountsReceivableAccountId,
                        debit: totalAmount,
                        credit: 0
                    },
                    {
                        accountId: settings.salesRevenueAccountId,
                        debit: 0,
                        credit: totalAmount
                    }
                ]
            },
            transaction
        );

        await postingService.postJournalEntry(
            {
                entryNumber: `COGS-${invoice.invoiceNumber}`,
                date: new Date(),
                description: `تكلفة بضاعة مباعة لفاتورة رقم ${invoice.invoiceNumber}`,
                lines: [
                    {
                        accountId: settings.costOfGoodsSoldAccountId,
                        debit: totalCost,
                        credit: 0
                    },
                    {
                        accountId: settings.inventoryAccountId,
                        debit: 0,
                        credit: totalCost
                    }
                ]
            },
            transaction
        );

        await transaction.commit();

        return await getSalesInvoiceById(invoice.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getSalesInvoices = async () => {
    return await SalesInvoice.findAll({
        include: [
            {
                model: Customer,
                attributes: ["id", "name"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            },
            { model: SalesQuotation, attributes: ["id", "quotationNumber", "status"], required: false },
            {
                model: SalesInvoiceItem,
                include: [
                    {
                        model: Product,
                        attributes: ["id", "name", "sku", "isbn", "costPrice"]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const getSalesInvoiceById = async (id) => {
    const invoice = await SalesInvoice.findByPk(id, {
        include: [
            {
                model: Customer,
                attributes: ["id", "name"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            },
            { model: SalesQuotation, attributes: ["id", "quotationNumber", "status"], required: false },
            {
                model: SalesInvoiceItem,
                include: [
                    {
                        model: Product,
                        attributes: ["id", "name", "sku", "isbn", "costPrice"]
                    }
                ]
            }
        ]
    });

    if (!invoice) {
        throw new Error("Sales invoice not found");
    }

    return invoice;
};


const updateSalesInvoice = async (id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const invoice = await SalesInvoice.findByPk(id, { transaction });
        if (!invoice) throw new Error("Sales invoice not found");
        const { customerId, warehouseId, salesQuotationId, invoiceNumber, date, dueDate, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        const customer = await Customer.findByPk(customerId, { transaction });
        if (!customer) throw new Error("Customer not found");
        const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
        if (!warehouse) throw new Error("Warehouse not found");
        if (!items.length) throw new Error("Invoice items are required");
        const oldItems = await SalesInvoiceItem.findAll({ where: { salesInvoiceId: id }, transaction });
        for (const old of oldItems) {
            const inventory = await Inventory.findOne({ where: { productId: old.productId, warehouseId: invoice.warehouseId }, transaction });
            if (inventory) await inventory.update({ quantity: Number(inventory.quantity) + Number(old.quantity) }, { transaction });
        }
        await SalesInvoiceItem.destroy({ where: { salesInvoiceId: id }, transaction });
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) throw new Error(`Product not found: ${item.productId}`);
            const inventory = await Inventory.findOne({ where: { productId: item.productId, warehouseId }, transaction });
            if (!inventory || Number(inventory.quantity) < Number(item.quantity)) throw new Error(`Not enough stock for productId: ${item.productId}`);
            const base = Number(item.quantity) * Number(item.unitPrice);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            const lineTotal = afterDiscount + itemTaxAmount;
            totalAmount += lineTotal;
            await SalesInvoiceItem.create({ salesInvoiceId: invoice.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, priceBeforeTax: base, discountPercent: Number(item.discountPercent || 0), discountAmount: itemDiscountAmount, taxPercent: Number(item.taxPercent || 0), taxAmount: itemTaxAmount, priceAfterTax: lineTotal, total: lineTotal }, { transaction });
            await inventory.update({ quantity: Number(inventory.quantity) - Number(item.quantity) }, { transaction });
        }
        totalAmount = totalAmount - Number(discountAmount || 0) + Number(taxAmount || 0);
        await invoice.update({ customerId, warehouseId, salesQuotationId: salesQuotationId || null, invoiceNumber, date: date || new Date(), dueDate: dueDate || null, referenceNumber, sourceType: salesQuotationId ? "SALES_QUOTATION" : null, sourceId: salesQuotationId || null, discountAmount, taxAmount, totalAmount, notes, status: data.status || invoice.status || "posted" }, { transaction });
        if (salesQuotationId) await salesQuotationService.markSalesQuotationConverted(salesQuotationId, transaction);
        await transaction.commit();
        return await getSalesInvoiceById(invoice.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

module.exports = {
    createSalesInvoice,
    updateSalesInvoice,
    getSalesInvoices,
    getSalesInvoiceById
};