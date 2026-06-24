const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Warehouse = sequelize.define(
    "Warehouse",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        location: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "warehouses",
        timestamps: true
    }
);

module.exports = Warehouse;