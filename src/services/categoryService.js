const { Op } = require("sequelize");
const { Category } = require("../models");

const pad = (n) => String(n).padStart(3, "0");
const generateCategoryCode = async (parentId) => {
    if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) throw new Error("Parent category not found");
        const count = await Category.count({ where: { parentId } });
        return `${parent.code || parent.id}-${pad(count + 1)}`;
    }
    return String((await Category.count({ where: { parentId: null } })) + 1);
};

const createCategory = async (data) => {
    const parentId = data.parentId || null;
    let level = 1;
    if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) throw new Error("Parent category not found");
        level = Number(parent.level || 1) + 1;
    }
    const exists = await Category.findOne({ where: { name: data.name, parentId } });
    if (exists) throw new Error("Category already exists in same level");
    const code = data.code || await generateCategoryCode(parentId);
    return await Category.create({ ...data, code, parentId, level, isActive: data.isActive ?? true });
};

const getCategories = async ({ search = "", page = 1, limit = 1000 }) => {
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { code: { [Op.like]: `%${search}%` } }];
    const { rows, count } = await Category.findAndCountAll({ where, limit: Number(limit), offset: (page - 1) * limit, order: [["code", "ASC"], ["createdAt", "ASC"]] });
    return { categories: rows, totalCategories: count, currentPage: Number(page), totalPages: Math.ceil(count / limit) };
};
const getCategoryById = async (id) => { const row = await Category.findByPk(id); if (!row) throw new Error("Category not found"); return row; };
const updateCategory = async (id, data) => { const row = await getCategoryById(id); await row.update({ name: data.name ?? row.name, nameEn: data.nameEn ?? row.nameEn, description: data.description ?? row.description, isActive: data.isActive ?? row.isActive }); return row; };
const deleteCategory = async (id) => { const children = await Category.count({ where: { parentId: id } }); if (children) throw new Error("Cannot delete category that has child categories"); const row = await getCategoryById(id); await row.destroy(); return { message: "Category deleted successfully" }; };
module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
