const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");
const roleController = require("../controllers/roleController");
const router = express.Router();
router.use(authMiddleware);
router.use(permissionMiddleware("manage_users"));
router.get("/", roleController.getRoles);
module.exports = router;
