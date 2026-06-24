const express = require("express");
const paymentVoucherController = require("../controllers/paymentVoucherController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_payments"));

router.post("/", paymentVoucherController.createPaymentVoucher);
router.get("/", paymentVoucherController.getPaymentVouchers);
router.get("/:id", paymentVoucherController.getPaymentVoucherById);

module.exports = router;