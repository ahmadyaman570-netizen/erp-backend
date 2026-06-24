const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");
const auditLogController = require("../controllers/auditLogController");
const router = express.Router();
router.use(authMiddleware);
router.use(permissionMiddleware("manage_users"));
router.get("/", auditLogController.getAuditLogs);
module.exports = router;
