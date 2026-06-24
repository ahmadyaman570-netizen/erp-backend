const express = require("express");
const salesInvoiceController =
    require("../controllers/salesInvoiceController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_sales"));

router.post("/", salesInvoiceController.createSalesInvoice);
router.put("/:id", salesInvoiceController.updateSalesInvoice);
router.get("/", salesInvoiceController.getSalesInvoices);
router.get("/:id", salesInvoiceController.getSalesInvoiceById);

module.exports = router;