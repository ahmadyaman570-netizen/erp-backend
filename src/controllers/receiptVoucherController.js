const receiptVoucherService = require("../services/receiptVoucherService");

const createReceiptVoucher = async (req, res) => {
    try {
        const voucher =
            await receiptVoucherService.createReceiptVoucher(req.body);

        res.status(201).json({
            message: "Receipt voucher created successfully",
            voucher
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getReceiptVouchers = async (req, res) => {
    try {
        const vouchers =
            await receiptVoucherService.getReceiptVouchers();

        res.json(vouchers);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getReceiptVoucherById = async (req, res) => {
    try {
        const voucher =
            await receiptVoucherService.getReceiptVoucherById(req.params.id);

        res.json(voucher);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createReceiptVoucher,
    getReceiptVouchers,
    getReceiptVoucherById
};