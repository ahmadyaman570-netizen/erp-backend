const productService = require("../services/productService");

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);

        res.json(product);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );

        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const result = await productService.deleteProduct(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};