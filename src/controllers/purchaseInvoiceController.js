const purchaseInvoiceService = require("../services/purchaseInvoiceService");

const createPurchaseInvoice = async (req, res) => {
    try {
        const invoice =
            await purchaseInvoiceService.createPurchaseInvoice(req.body);

        res.status(201).json({
            message: "Purchase invoice created successfully",
            invoice
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const updatePurchaseInvoice = async (req, res) => {
    try {
        const invoice = await purchaseInvoiceService.updatePurchaseInvoice(req.params.id, req.body);
        res.json({ message: "Purchase invoice updated successfully", invoice });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPurchaseInvoices = async (req, res) => {
    try {
        const invoices =
            await purchaseInvoiceService.getPurchaseInvoices();

        res.json({
            invoices
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getPurchaseInvoiceById = async (req, res) => {
    try {
        const invoice =
            await purchaseInvoiceService.getPurchaseInvoiceById(
                req.params.id
            );

        res.json(invoice);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createPurchaseInvoice,
    updatePurchaseInvoice,
    getPurchaseInvoices,
    getPurchaseInvoiceById
};