const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define(
    "Inventory",
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

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        tableName: "inventories",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["productId", "warehouseId"]
            }
        ]
    }
);

module.exports = Inventory;