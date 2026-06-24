const express = require("express");
const controller = require("../controllers/systemSettingController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");
const router = express.Router();
router.use(authMiddleware);
router.get("/", controller.getSettings);
router.put("/", permissionMiddleware("manage_settings"), controller.updateSettings);
module.exports = router;
