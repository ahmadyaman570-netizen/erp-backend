const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);

        res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await categoryService.getCategories(req.query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);

        res.json(category);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(
            req.params.id,
            req.body
        );

        res.json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};