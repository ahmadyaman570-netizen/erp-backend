const customerService = require("../services/customerService");

const createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);

        res.status(201).json({
            message: "Customer created successfully",
            customer
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getCustomers = async (req, res) => {
    try {
        const result = await customerService.getCustomers(req.query);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);

        res.json(customer);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer = await customerService.updateCustomer(
            req.params.id,
            req.body
        );

        res.json({
            message: "Customer updated successfully",
            customer
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};