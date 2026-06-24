const express = require("express");
const receiptVoucherController = require("../controllers/receiptVoucherController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_payments"));

router.post("/", receiptVoucherController.createReceiptVoucher);
router.get("/", receiptVoucherController.getReceiptVouchers);
router.get("/:id", receiptVoucherController.getReceiptVoucherById);

module.exports = router;