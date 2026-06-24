const express = require("express");
const purchaseInvoiceController = require("../controllers/purchaseInvoiceController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();
router.use(authMiddleware);
router.use(permissionMiddleware("manage_purchases"));
router.post("/", purchaseInvoiceController.createPurchaseInvoice);
router.put("/:id", purchaseInvoiceController.updatePurchaseInvoice);
router.get("/", purchaseInvoiceController.getPurchaseInvoices);
router.get("/:id", purchaseInvoiceController.getPurchaseInvoiceById);

module.exports = router;