const service = require("../services/purchaseOrderService");

const createPurchaseOrder = async (req, res) => {
    try { res.status(201).json({ message: "Purchase order created successfully", order: await service.createPurchaseOrder(req.body) }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const updatePurchaseOrder = async (req, res) => {
    try { res.json({ message: "Purchase order updated successfully", order: await service.updatePurchaseOrder(req.params.id, req.body) }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const getPurchaseOrders = async (req, res) => {
    try { res.json({ orders: await service.getPurchaseOrders() }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const getPurchaseOrderById = async (req, res) => {
    try { res.json(await service.getPurchaseOrderById(req.params.id)); }
    catch (error) { res.status(404).json({ message: error.message }); }
};
module.exports = { createPurchaseOrder, updatePurchaseOrder, getPurchaseOrders, getPurchaseOrderById };
