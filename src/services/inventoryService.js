const {
    Inventory,
    InventoryTransaction,
    Product,
    Warehouse
} = require("../models");

const addInventoryTransaction = async (data) => {
    const {
        productId,
        warehouseId,
        type,
        quantity,
        note
    } = data;

    const product = await Product.findByPk(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const warehouse = await Warehouse.findByPk(warehouseId);

    if (!warehouse) {
        throw new Error("Warehouse not found");
    }

    let inventory = await Inventory.findOne({
        where: {
            productId,
            warehouseId
        }
    });

    if (!inventory) {
        inventory = await Inventory.create({
            productId,
            warehouseId,
            quantity: 0
        });
    }

    let newQuantity = inventory.quantity;

    if (type === "IN") {
        newQuantity += Number(quantity);
    }

    if (type === "OUT") {
        if (inventory.quantity < Number(quantity)) {
            throw new Error("Not enough stock");
        }

        newQuantity -= Number(quantity);
    }

    if (type === "ADJUSTMENT") {
        newQuantity = Number(quantity);
    }

    await inventory.update({
        quantity: newQuantity
    });

    const transaction = await InventoryTransaction.create({
        productId,
        warehouseId,
        type,
        quantity,
        note
    });

    return {
        inventory,
        transaction
    };
};

const getInventory = async () => {
    return await Inventory.findAll({
        include: [
            {
                model: Product,
                attributes: ["id", "name", "sku"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

const getInventoryTransactions = async () => {
    return await InventoryTransaction.findAll({
        include: [
            {
                model: Product,
                attributes: ["id", "name", "sku"]
            },
            {
                model: Warehouse,
                attributes: ["id", "name"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
};

module.exports = {
    addInventoryTransaction,
    getInventory,
    getInventoryTransactions
};