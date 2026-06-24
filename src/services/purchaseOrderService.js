const { Supplier, Warehouse, Product, PurchaseOrder, PurchaseOrderItem } = require("../models");
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
    if (!items || !items.length) throw new Error("Order items are required");
    let itemsTotal = 0;
    for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (Number(item.quantity) <= 0 || Number(item.unitCost) <= 0) throw new Error("Quantity and cost must be greater than zero");
        itemsTotal += calcLine(item, "unitCost").total;
    }
    return itemsTotal;
};

const saveItems = async (purchaseOrderId, items, transaction) => {
    await PurchaseOrderItem.destroy({ where: { purchaseOrderId }, transaction });
    for (const item of items) {
        const line = calcLine(item, "unitCost");
        await PurchaseOrderItem.create({
            purchaseOrderId,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
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

const createPurchaseOrder = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const { supplierId, warehouseId, orderNumber, date, expectedDate, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        if (!supplierId) throw new Error("Supplier is required");
        const supplier = await Supplier.findByPk(supplierId, { transaction });
        if (!supplier) throw new Error("Supplier not found");
        if (warehouseId) {
            const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
            if (!warehouse) throw new Error("Warehouse not found");
        }
        const itemsTotal = await validateAndTotal(items, transaction);
        const totalAmount = itemsTotal - Number(discountAmount || 0) + Number(taxAmount || 0);
        const order = await PurchaseOrder.create({ supplierId, warehouseId: warehouseId || null, orderNumber, date: date || new Date(), expectedDate: expectedDate || null, referenceNumber, discountAmount, taxAmount, totalAmount, notes, status: data.status || "draft" }, { transaction });
        await saveItems(order.id, items, transaction);
        await transaction.commit();
        return await getPurchaseOrderById(order.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

const updatePurchaseOrder = async (id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await PurchaseOrder.findByPk(id, { transaction });
        if (!order) throw new Error("Purchase order not found");
        const { supplierId, warehouseId, orderNumber, date, expectedDate, referenceNumber, discountAmount = 0, taxAmount = 0, notes, items = [] } = data;
        if (!supplierId) throw new Error("Supplier is required");
        const supplier = await Supplier.findByPk(supplierId, { transaction });
        if (!supplier) throw new Error("Supplier not found");
        if (warehouseId) {
            const warehouse = await Warehouse.findByPk(warehouseId, { transaction });
            if (!warehouse) throw new Error("Warehouse not found");
        }
        const itemsTotal = await validateAndTotal(items, transaction);
        const totalAmount = itemsTotal - Number(discountAmount || 0) + Number(taxAmount || 0);
        await order.update({ supplierId, warehouseId: warehouseId || null, orderNumber, date: date || new Date(), expectedDate: expectedDate || null, referenceNumber, discountAmount, taxAmount, totalAmount, notes, status: data.status || order.status || "draft" }, { transaction });
        await saveItems(order.id, items, transaction);
        await transaction.commit();
        return await getPurchaseOrderById(order.id);
    } catch (error) { await transaction.rollback(); throw error; }
};

const getPurchaseOrders = async () => PurchaseOrder.findAll({ include: [{ model: Supplier, attributes: ["id", "name"] }, { model: Warehouse, attributes: ["id", "name"] }, { model: PurchaseOrderItem, include: [{ model: Product, attributes: ["id", "name", "sku", "isbn"] }] }], order: [["createdAt", "DESC"]] });
const getPurchaseOrderById = async (id) => {
    const order = await PurchaseOrder.findByPk(id, { include: [{ model: Supplier, attributes: ["id", "name"] }, { model: Warehouse, attributes: ["id", "name"] }, { model: PurchaseOrderItem, include: [{ model: Product, attributes: ["id", "name", "sku", "isbn"] }] }] });
    if (!order) throw new Error("Purchase order not found");
    return order;
};
const markPurchaseOrderConverted = async (id, transaction) => { const order = await PurchaseOrder.findByPk(id, { transaction }); if (order) await order.update({ status: "converted" }, { transaction }); };
module.exports = { createPurchaseOrder, updatePurchaseOrder, getPurchaseOrders, getPurchaseOrderById, markPurchaseOrderConverted };
