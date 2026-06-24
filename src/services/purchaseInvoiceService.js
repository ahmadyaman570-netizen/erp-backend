const sequelize = require("../config/database");
const postingService = require("./postingService");
const accountingSettingService = require("./accountingSettingService");

const {
    Supplier,
    Warehouse,
    Product,
    Inventory,
    InventoryTransaction,
    PurchaseInvoice,
    PurchaseInvoiceItem,
    PurchaseOrder
} = require("../models");
const purchaseOrderService = require("./purchaseOrderService");

const createPurchaseInvoice = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            supplierId,
            warehouseId,
            purchaseOrderId,
            invoiceNumber,
            date,
            dueDate,
            referenceNumber,
            discountAmount = 0,
            taxAmount = 0,
            notes,
            items
        } = data;

        const supplier = await Supplier.findByPk(supplierId, {
            transaction
        });

        if (!supplier) {
            throw new Error("Supplier not found");
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

            if (Number(item.unitCost) <= 0) {
                throw new Error("Unit cost must be greater than zero");
            }

            const base = Number(item.quantity) * Number(item.unitCost);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            totalAmount += afterDiscount + itemTaxAmount;
        }

        totalAmount = totalAmount - Number(discountAmount || 0) + Number(taxAmount || 0);

        const invoice = await PurchaseInvoice.create(
            {
                supplierId,
                warehouseId,
                purchaseOrderId: purchaseOrderId || null,
                invoiceNumber,
                date: date || new Date(),
                dueDate: dueDate || null,
                referenceNumber,
                sourceType: purchaseOrderId ? "PURCHASE_ORDER" : null,
                sourceId: purchaseOrderId || null,
                discountAmount,
                taxAmount,
                totalAmount,
                notes,
                status: "posted"
            },
            { transaction }
        );

        for (const item of items) {
            const base = Number(item.quantity) * Number(item.unitCost);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            const lineTotal = afterDiscount + itemTaxAmount;

            await PurchaseInvoiceItem.create(
                {
                    purchaseInvoiceId: invoice.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
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

            let inventory = await Inventory.findOne({
                where: {
                    productId: item.productId,
                    warehouseId
                },
                transaction
            });

            if (!inventory) {
                inventory = await Inventory.create(
                    {
                        productId: item.productId,
                        warehouseId,
                        quantity: 0
                    },
                    { transaction }
                );
            }

            await inventory.update(
                {
                    quantity:
                        Number(inventory.quantity) +
                        Number(item.quantity)
                },
                { transaction }
            );

            await InventoryTransaction.create(
                {
                    productId: item.productId,
                    warehouseId,
                    type: "IN",
                    quantity: item.quantity,
                    note: `فاتورة مشتريات رقم ${invoice.invoiceNumber}`
                },
                { transaction }
            );
        }

        if (purchaseOrderId) {
            await purchaseOrderService.markPurchaseOrderConverted(purchaseOrderId, transaction);
        }

        const settings =
            await accountingSettingService.getAccountingSettings();

        await postingService.postJournalEntry(
            {
                entryNumber: `JE-${invoice.invoiceNumber}`,
                date: new Date(),
                description: `فاتورة مشتريات رقم ${invoice.invoiceNumber}`,
                lines: [
                    {
                        accountId: settings.inventoryAccountId,
                        debit: totalAmount,
                        credit: 0
                    },
                    {
                        accountId: supplier.accountId || settings.accountsPayableAccountId,
                        debit: 0,
                        credit: totalAmount
                    }
                ]
            },
            transaction
        );

        await transaction.commit();

        return await getPurchaseInvoiceById(invoice.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getPurchaseInvoices = async () => {
    return await PurchaseInvoice.findAll({
        include: [
            {
                model: Supplier,
                attributes: ["id", "name"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            },
            { model: PurchaseOrder, attributes: ["id", "orderNumber", "status"], required: false },
            {
                model: PurchaseInvoiceItem,
                include: [
                    {
                        model: Product,
                        attributes: ["id", "name", "sku", "isbn"]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const getPurchaseInvoiceById = async (id) => {
    const invoice = await PurchaseInvoice.findByPk(id, {
        include: [
            {
                model: Supplier,
                attributes: ["id", "name"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            },
            { model: PurchaseOrder, attributes: ["id", "orderNumber", "status"], required: false },
            {
                model: PurchaseInvoiceItem,
                include: [
                    {
                        model: Product,
                        attributes: ["id", "name", "sku", "isbn"]
                    }
                ]
            }
        ]
    });

    if (!invoice) {
        throw new Error("Purchase invoice not found");
    }

    return invoice;
};

const updatePurchaseInvoice = async (id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const invoice = await PurchaseInvoice.findByPk(id, { transaction });
        if (!invoice) throw new Error("Purchase invoice not found");
        const { supplierId, warehouseId, purchaseOrderId, invoiceNumber, date, dueDate, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        const supplier = await Supplier.findByPk(supplierId, { transaction });
        if (!supplier) throw new Error("Supplier not found");
        const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
        if (!warehouse) throw new Error("Warehouse not found");
        if (!items.length) throw new Error("Invoice items are required");
        const oldItems = await PurchaseInvoiceItem.findAll({ where: { purchaseInvoiceId: id }, transaction });
        for (const old of oldItems) {
            const inventory = await Inventory.findOne({ where: { productId: old.productId, warehouseId: invoice.warehouseId }, transaction });
            if (inventory) await inventory.update({ quantity: Number(inventory.quantity) - Number(old.quantity) }, { transaction });
        }
        await PurchaseInvoiceItem.destroy({ where: { purchaseInvoiceId: id }, transaction });
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) throw new Error(`Product not found: ${item.productId}`);
            const base = Number(item.quantity) * Number(item.unitCost);
            const itemDiscountAmount = Number(item.discountAmount || (base * Number(item.discountPercent || 0) / 100));
            const afterDiscount = base - itemDiscountAmount;
            const itemTaxAmount = Number(item.taxAmount || (afterDiscount * Number(item.taxPercent || 0) / 100));
            const lineTotal = afterDiscount + itemTaxAmount;
            totalAmount += lineTotal;
            await PurchaseInvoiceItem.create({ purchaseInvoiceId: invoice.id, productId: item.productId, quantity: item.quantity, unitCost: item.unitCost, priceBeforeTax: base, discountPercent: Number(item.discountPercent || 0), discountAmount: itemDiscountAmount, taxPercent: Number(item.taxPercent || 0), taxAmount: itemTaxAmount, priceAfterTax: lineTotal, total: lineTotal }, { transaction });
            let inventory = await Inventory.findOne({ where: { productId: item.productId, warehouseId }, transaction });
            if (!inventory) inventory = await Inventory.create({ productId: item.productId, warehouseId, quantity: 0 }, { transaction });
            await inventory.update({ quantity: Number(inventory.quantity) + Number(item.quantity) }, { transaction });
        }
        totalAmount = totalAmount - Number(discountAmount || 0) + Number(taxAmount || 0);
        await invoice.update({ supplierId, warehouseId, purchaseOrderId: purchaseOrderId || null, invoiceNumber, date: date || new Date(), dueDate: dueDate || null, referenceNumber, sourceType: purchaseOrderId ? "PURCHASE_ORDER" : null, sourceId: purchaseOrderId || null, discountAmount, taxAmount, totalAmount, notes, status: data.status || invoice.status || "posted" }, { transaction });
        if (purchaseOrderId) await purchaseOrderService.markPurchaseOrderConverted(purchaseOrderId, transaction);
        await transaction.commit();
        return await getPurchaseInvoiceById(invoice.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

module.exports = {
    createPurchaseInvoice,
    updatePurchaseInvoice,
    getPurchaseInvoices,
    getPurchaseInvoiceById
};