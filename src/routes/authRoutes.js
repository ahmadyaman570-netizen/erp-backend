const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get(
    "/profile",
    authMiddleware,
    authController.profile
);

router.get(
    "/admin-test",
    authMiddleware,
    permissionMiddleware("manage_users"),
    (req, res) => {
        res.json({
            message: "You have manage_users permission"
        });
    }
);

module.exports = router;