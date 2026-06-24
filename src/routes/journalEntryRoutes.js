const express = require("express");
const journalEntryController = require("../controllers/journalEntryController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(permissionMiddleware("manage_accounts"));

router.post("/", journalEntryController.createJournalEntry);
router.get("/", journalEntryController.getJournalEntries);
router.get("/:id", journalEntryController.getJournalEntryById);

module.exports = router;