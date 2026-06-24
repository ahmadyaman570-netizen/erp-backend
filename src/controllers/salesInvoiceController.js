const salesInvoiceService = require("../services/salesInvoiceService");

const createSalesInvoice = async (req, res) => {
    try {
        const invoice =
            await salesInvoiceService.createSalesInvoice(req.body);

        res.status(201).json({
            message: "Sales invoice created successfully",
            invoice
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const updateSalesInvoice = async (req, res) => {
    try {
        const invoice = await salesInvoiceService.updateSalesInvoice(req.params.id, req.body);
        res.json({ message: "Sales invoice updated successfully", invoice });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSalesInvoices = async (req, res) => {
    try {
        const invoices =
            await salesInvoiceService.getSalesInvoices();

        res.json({
            invoices
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getSalesInvoiceById = async (req, res) => {
    try {
        const invoice =
            await salesInvoiceService.getSalesInvoiceById(
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
    createSalesInvoice,
    updateSalesInvoice,
    getSalesInvoices,
    getSalesInvoiceById
};