const journalEntryService = require("../services/journalEntryService");

const createJournalEntry = async (req, res) => {
    try {
        const journalEntry = await journalEntryService.createJournalEntry(req.body);

        res.status(201).json({
            message: "Journal entry created successfully",
            journalEntry
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getJournalEntries = async (req, res) => {
    try {
        const journalEntries = await journalEntryService.getJournalEntries();

        res.json(journalEntries);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getJournalEntryById = async (req, res) => {
    try {
        const journalEntry = await journalEntryService.getJournalEntryById(
            req.params.id
        );

        res.json(journalEntry);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

module.exports = {
    createJournalEntry,
    getJournalEntries,
    getJournalEntryById
};