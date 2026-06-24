const { Op } = require("sequelize");
const { Warehouse } = require("../models");

const createWarehouse = async (data) => {
    const existingWarehouse = await Warehouse.findOne({
        where: { name: data.name }
    });

    if (existingWarehouse) {
        throw new Error("Warehouse already exists");
    }

    return await Warehouse.create(data);
};

const getWarehouses = async ({ search = "", page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } }
        ];
    }

    const { rows, count } = await Warehouse.findAndCountAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [["createdAt", "DESC"]]
    });

    return {
        warehouses: rows,
        totalWarehouses: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit)
    };
};

const getWarehouseById = async (id) => {
    const warehouse = await Warehouse.findByPk(id);

    if (!warehouse) {
        throw new Error("Warehouse not found");
    }

    return warehouse;
};

const updateWarehouse = async (id, data) => {
    const warehouse = await getWarehouseById(id);

    await warehouse.update(data);

    return warehouse;
};

const deleteWarehouse = async (id) => {
    const warehouse = await getWarehouseById(id);

    await warehouse.destroy();

    return {
        message: "Warehouse deleted successfully"
    };
};

module.exports = {
    createWarehouse,
    getWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};