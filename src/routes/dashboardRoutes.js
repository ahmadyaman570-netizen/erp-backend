const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("view_dashboard"));

router.get("/summary", dashboardController.getDashboardSummary);

module.exports = router;