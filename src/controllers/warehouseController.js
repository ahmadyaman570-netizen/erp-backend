const warehouseService = require("../services/warehouseService");

const createWarehouse = async (req, res) => {
    try {
        const warehouse = await warehouseService.createWarehouse(req.body);

        res.status(201).json({
            message: "Warehouse created successfully",
            warehouse
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWarehouses = async (req, res) => {
    try {
        const result = await warehouseService.getWarehouses(req.query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await warehouseService.getWarehouseById(req.params.id);

        res.json(warehouse);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await warehouseService.updateWarehouse(
            req.params.id,
            req.body
        );

        res.json({
            message: "Warehouse updated successfully",
            warehouse
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const deleteWarehouse = async (req, res) => {
    try {
        const result = await warehouseService.deleteWarehouse(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};