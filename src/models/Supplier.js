const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Supplier = sequelize.define(
    "Supplier",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        code: { type: DataTypes.STRING, allowNull: true, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        nameEn: { type: DataTypes.STRING, allowNull: true },
        supplierType: { type: DataTypes.ENUM("INDIVIDUAL", "COMPANY", "GROUP"), allowNull: false, defaultValue: "COMPANY" },
        parentId: { type: DataTypes.INTEGER, allowNull: true },
        level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        accountId: { type: DataTypes.INTEGER, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        email: { type: DataTypes.STRING, allowNull: true },
        taxNumber: { type: DataTypes.STRING, allowNull: true },
        balance: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
        address: { type: DataTypes.TEXT, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { tableName: "suppliers", timestamps: true }
);

module.exports = Supplier;
