const supplierService = require("../services/supplierService");

const createSupplier = async (req, res) => {
    try {
        const supplier = await supplierService.createSupplier(req.body);

        res.status(201).json({
            message: "Supplier created successfully",
            supplier
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const result = await supplierService.getSuppliers(req.query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);

        res.json(supplier);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await supplierService.updateSupplier(
            req.params.id,
            req.body
        );

        res.json({
            message: "Supplier updated successfully",
            supplier
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const result = await supplierService.deleteSupplier(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};