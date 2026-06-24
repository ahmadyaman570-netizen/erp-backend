const accountService = require("../services/accountService");

const createAccount = async (req, res) => {
    try {
        const account = await accountService.createAccount(req.body);

        res.status(201).json({
            message: "Account created successfully",
            account
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getAccounts = async (req, res) => {
    try {
        const accounts = await accountService.getAccounts(req.query);

        res.json(accounts);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getAccountById = async (req, res) => {
    try {
        const account = await accountService.getAccountById(req.params.id);

        res.json(account);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateAccount = async (req, res) => {
    try {
        const account = await accountService.updateAccount(
            req.params.id,
            req.body
        );

        res.json({
            message: "Account updated successfully",
            account
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const result = await accountService.deleteAccount(req.params.id);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount
};