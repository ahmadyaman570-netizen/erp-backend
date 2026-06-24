const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InventoryTransaction = sequelize.define(
    "InventoryTransaction",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        warehouseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM("IN", "OUT", "ADJUSTMENT"),
            allowNull: false
        },

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        note: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "inventory_transactions",
        timestamps: true
    }
);

module.exports = InventoryTransaction;