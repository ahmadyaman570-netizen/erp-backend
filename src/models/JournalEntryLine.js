const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const JournalEntryLine = sequelize.define("JournalEntryLine", {
    journalEntryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    debit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
 
    credit: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    }
}, { tableName: "journal_entry_lines", timestamps: true });

module.exports = JournalEntryLine;