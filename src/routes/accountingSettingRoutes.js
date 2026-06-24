const express = require("express");
const accountingSettingController = require("../controllers/accountingSettingController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_accounts"));

router.get("/", accountingSettingController.getAccountingSettings);
router.put("/", accountingSettingController.upsertAccountingSettings);

module.exports = router;