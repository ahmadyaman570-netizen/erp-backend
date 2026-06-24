const { Customer, Warehouse, Product, SalesQuotation, SalesQuotationItem } = require("../models");
const sequelize = require("../config/database");

const calcLine = (item, priceKey) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item[priceKey] || 0);
    const base = qty * price;
    const discountPercent = Number(item.discountPercent || 0);
    const discountAmount = Number(item.discountAmount || (base * discountPercent / 100));
    const afterDiscount = base - discountAmount;
    const taxPercent = Number(item.taxPercent || 0);
    const taxAmount = Number(item.taxAmount || (afterDiscount * taxPercent / 100));
    const total = afterDiscount + taxAmount;
    return { base, discountPercent, discountAmount, taxPercent, taxAmount, total };
};

const validateAndTotal = async (items, transaction) => {
    if (!items || !items.length) throw new Error("Quotation items are required");
    let itemsTotal = 0;
    for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (Number(item.quantity) <= 0 || Number(item.unitPrice) <= 0) throw new Error("Quantity and price must be greater than zero");
        itemsTotal += calcLine(item, "unitPrice").total;
    }
    return itemsTotal;
};

const saveItems = async (salesQuotationId, items, transaction) => {
    await SalesQuotationItem.destroy({ where: { salesQuotationId }, transaction });
    for (const item of items) {
        const line = calcLine(item, "unitPrice");
        await SalesQuotationItem.create({
            salesQuotationId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            priceBeforeTax: line.base,
            discountPercent: line.discountPercent,
            discountAmount: line.discountAmount,
            taxPercent: line.taxPercent,
            taxAmount: line.taxAmount,
            priceAfterTax: line.total,
            total: line.total
        }, { transaction });
    }
};

const createSalesQuotation = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const { customerId, warehouseId, quotationNumber, date, validUntil, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        if (!customerId) throw new Error("Customer is required");
        const customer = await Customer.findByPk(customerId, { transaction });
        if (!customer) throw new Error("Customer not found");
        if (warehouseId) {
            const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
            if (!warehouse) throw new Error("Warehouse not found");
        }
        const itemsTotal = await validateAndTotal(items, transaction);
        const totalAmount = itemsTotal - Number(discountAmount || 0) + Number(taxAmount || 0);
        const quotation = await SalesQuotation.create({ customerId, warehouseId: warehouseId || null, quotationNumber, date: date || new Date(), validUntil: validUntil || null, referenceNumber, discountAmount, taxAmount, totalAmount, notes, status: data.status || "draft" }, { transaction });
        await saveItems(quotation.id, items, transaction);
        await transaction.commit();
        return await getSalesQuotationById(quotation.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

const updateSalesQuotation = async (id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const quotation = await SalesQuotation.findByPk(id, { transaction });
        if (!quotation) throw new Error("Sales quotation not found");
        const { customerId, warehouseId, quotationNumber, date, validUntil, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        if (!customerId) throw new Error("Customer is required");
        const customer = await Customer.findByPk(customerId, { transaction });
        if (!customer) throw new Error("Customer not found");
        if (warehouseId) {
            const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
            if (!warehouse) throw new Error("Warehouse not found");
        }
        const itemsTotal = await validateAndTotal(items, transaction);
        const totalAmount = itemsTotal - Number(discountAmount || 0) + Number(taxAmount || 0);
        await quotation.update({ customerId, warehouseId: warehouseId || null, quotationNumber, date: date || new Date(), validUntil: validUntil || null, referenceNumber, discountAmount, taxAmount, totalAmount, notes, status: data.status || quotation.status || "draft" }, { transaction });
        await saveItems(quotation.id, items, transaction);
        await transaction.commit();
        return await getSalesQuotationById(quotation.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

const getSalesQuotations = async () => SalesQuotation.findAll({ include: [{ model: Customer, attributes: ["id", "name"] }, { model: Warehouse, attributes: ["id", "name"] }, { model: SalesQuotationItem, include: [{ model: Product, attributes: ["id", "name", "sku", "isbn"] }] }], order: [["createdAt", "DESC"]] });
const getSalesQuotationById = async (id) => {
    const quotation = await SalesQuotation.findByPk(id, { include: [{ model: Customer, attributes: ["id", "name"] }, { model: Warehouse, attributes: ["id", "name"] }, { model: SalesQuotationItem, include: [{ model: Product, attributes: ["id", "name", "sku", "isbn"] }] }] });
    if (!quotation) throw new Error("Sales quotation not found");
    return quotation;
};
const markSalesQuotationConverted = async (id, transaction) => { const quotation = await SalesQuotation.findByPk(id, { transaction }); if (quotation) await quotation.update({ status: "converted" }, { transaction }); };
module.exports = { createSalesQuotation, updateSalesQuotation, getSalesQuotations, getSalesQuotationById, markSalesQuotationConverted };
