const { Account } = require("../models");
const journalEntryService = require("./journalEntryService");

const getAccountByCode = async (code, transaction = null) => {
    const account = await Account.findOne({
        where: { code },
        transaction
    });

    if (!account) {
        throw new Error(`Account with code ${code} not found`);
    }

    return account;
};

const postJournalEntry = async (
    {
        entryNumber,
        date,
        description,
        lines
    },
    transaction = null
) => {
    if (!entryNumber) {
        throw new Error("Entry number is required");
    }

    if (!date) {
        throw new Error("Entry date is required");
    }

    if (!lines || lines.length < 2) {
        throw new Error("Journal entry must have at least two lines");
    }

    return await journalEntryService.createJournalEntry(
        {
            entryNumber,
            date,
            description,
            lines
        },
        transaction
    );
};

module.exports = {
    getAccountByCode,
    postJournalEntry
};