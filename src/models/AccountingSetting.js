const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AccountingSetting = sequelize.define("AccountingSetting", {
    inventoryAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    accountsReceivableAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    accountsPayableAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    salesRevenueAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    costOfGoodsSoldAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    cashAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    bankAccountId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { tableName: "accounting_settings", timestamps: true });

module.exports = AccountingSetting;