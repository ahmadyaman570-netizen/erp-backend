const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();
router.use(authMiddleware);
router.use(permissionMiddleware("manage_inventory"));
router.post("/transactions", inventoryController.addInventoryTransaction);
router.get("/", inventoryController.getInventory);
router.get("/transactions", inventoryController.getInventoryTransactions);

module.exports = router; 