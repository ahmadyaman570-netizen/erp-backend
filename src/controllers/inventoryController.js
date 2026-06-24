const inventoryService = require("../services/inventoryService");

const addInventoryTransaction = async (req, res) => {
    try {
        const result = await inventoryService.addInventoryTransaction(req.body);

        res.status(201).json({
            message: "Inventory transaction created successfully",
            ...result
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getInventory = async (req, res) => {
    try {
        const inventory = await inventoryService.getInventory();

        res.json({
            inventory
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getInventoryTransactions = async (req, res) => {
    try {
        const transactions =
            await inventoryService.getInventoryTransactions();

        res.json({
            transactions
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    addInventoryTransaction,
    getInventory,
    getInventoryTransactions
};