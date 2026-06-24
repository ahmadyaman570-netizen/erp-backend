const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "Category",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        nameEn: { type: DataTypes.STRING, allowNull: true },
        code: { type: DataTypes.STRING, allowNull: true },
        parentId: { type: DataTypes.INTEGER, allowNull: true },
        level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        description: { type: DataTypes.TEXT, allowNull: true }
    },
    { tableName: "categories", timestamps: true }
);

module.exports = Category;
