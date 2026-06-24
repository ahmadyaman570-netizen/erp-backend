const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const JournalEntry = sequelize.define("JournalEntry", {
    entryNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    referenceNumber: { type: DataTypes.STRING, allowNull: true },
    sourceType: { type: DataTypes.STRING, allowNull: true },
    sourceId: { type: DataTypes.INTEGER, allowNull: true },
    branchId: { type: DataTypes.INTEGER, allowNull: true },
    costCenterId: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "مرحل" },
    createdBy: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: "journal_entries", timestamps: true });

module.exports = JournalEntry;