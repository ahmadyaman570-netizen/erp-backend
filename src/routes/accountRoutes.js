const express = require("express");
const accountController = require("../controllers/accountController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_accounts"));

router.post("/", accountController.createAccount);
router.get("/", accountController.getAccounts);
router.get("/:id", accountController.getAccountById);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

module.exports = router;