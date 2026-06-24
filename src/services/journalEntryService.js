const sequelize = require("../config/database");
const {
    JournalEntry,
    JournalEntryLine,
    Account
} = require("../models");

const createJournalEntry = async (data, externalTransaction = null) => {
    const { entryNumber, date, description, lines } = data;

    if (!lines || lines.length < 2) {
        throw new Error("Journal entry must have at least two lines");
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        if (debit > 0 && credit > 0) {
            throw new Error("Line cannot have both debit and credit");
        }

        if (debit === 0 && credit === 0) {
            throw new Error("Line must have debit or credit value");
        }

        const account = await Account.findByPk(line.accountId, {
            transaction: externalTransaction
        });

        if (!account) {
            throw new Error(`Account not found: ${line.accountId}`);
        }

        totalDebit += debit;
        totalCredit += credit;
    }

    if (totalDebit !== totalCredit) {
        throw new Error("Journal entry is not balanced");
    }

    const createEntry = async (transaction) => {
        const journalEntry = await JournalEntry.create(
            {
                entryNumber,
                date,
                description
            },
            { transaction }
        );

        for (const line of lines) {
            await JournalEntryLine.create(
                {
                    journalEntryId: journalEntry.id,
                    accountId: line.accountId,
                    debit: line.debit || 0,
                    credit: line.credit || 0
                },
                { transaction }
            );
        }

        return journalEntry;
    };

    if (externalTransaction) {
        return await createEntry(externalTransaction);
    }

    const result = await sequelize.transaction(createEntry);

    return await getJournalEntryById(result.id);
};

const getJournalEntries = async () => {
    return await JournalEntry.findAll({
        include: [
            {
                model: JournalEntryLine,
                as: "lines",
                include: [
                    {
                        model: Account,
                        as: "account"
                    }
                ]
            }
        ],
        order: [["id", "DESC"]]
    });
};

const getJournalEntryById = async (id) => {
    const journalEntry = await JournalEntry.findByPk(id, {
        include: [
            {
                model: JournalEntryLine,
                as: "lines",
                include: [
                    {
                        model: Account,
                        as: "account"
                    }
                ]
            }
        ]
    });

    if (!journalEntry) {
        throw new Error("Journal entry not found");
    }

    return journalEntry;
};

module.exports = {
    createJournalEntry,
    getJournalEntries,
    getJournalEntryById
};