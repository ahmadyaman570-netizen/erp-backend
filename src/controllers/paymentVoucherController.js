const paymentVoucherService = require("../services/paymentVoucherService");

const createPaymentVoucher = async (req, res) => {
    try {
        const voucher =
            await paymentVoucherService.createPaymentVoucher(req.body);

        res.status(201).json({
            message: "Payment voucher created successfully",
            voucher
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getPaymentVouchers = async (req, res) => {
    try {
        const vouchers =
            await paymentVoucherService.getPaymentVouchers();

        res.json(vouchers);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getPaymentVoucherById = async (req, res) => {
    try {
        const voucher =
            await paymentVoucherService.getPaymentVoucherById(req.params.id);

        res.json(voucher);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createPaymentVoucher,
    getPaymentVouchers,
    getPaymentVoucherById
};