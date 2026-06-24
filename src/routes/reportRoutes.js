const express = require("express");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("view_reports"));

router.get("/general-ledger", reportController.getGeneralLedger);
router.get("/account-statement", reportController.getAccountStatement);
router.get("/trial-balance", reportController.getTrialBalance);
router.get("/sales", reportController.getSalesReport);
router.get("/purchases", reportController.getPurchasesReport);
router.get("/inventory", reportController.getInventoryReport);
router.get("/inventory-movements", reportController.getInventoryMovementReport);
router.get("/products-by-category", reportController.getProductsByCategory);
router.get("/customers", reportController.getCustomersReport);
router.get("/suppliers", reportController.getSuppliersReport);
router.get("/vouchers", reportController.getVouchersReport);

module.exports = router;
