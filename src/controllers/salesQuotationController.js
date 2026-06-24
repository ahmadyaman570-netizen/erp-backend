const service = require("../services/salesQuotationService");

const createSalesQuotation = async (req, res) => {
    try { res.status(201).json({ message: "Sales quotation created successfully", quotation: await service.createSalesQuotation(req.body) }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const updateSalesQuotation = async (req, res) => {
    try { res.json({ message: "Sales quotation updated successfully", quotation: await service.updateSalesQuotation(req.params.id, req.body) }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const getSalesQuotations = async (req, res) => {
    try { res.json({ quotations: await service.getSalesQuotations() }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
const getSalesQuotationById = async (req, res) => {
    try { res.json(await service.getSalesQuotationById(req.params.id)); }
    catch (error) { res.status(404).json({ message: error.message }); }
};
module.exports = { createSalesQuotation, updateSalesQuotation, getSalesQuotations, getSalesQuotationById };
