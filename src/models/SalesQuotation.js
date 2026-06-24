const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesQuotation = sequelize.define("SalesQuotation", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: true },
    quotationNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    validUntil: { type: DataTypes.DATEONLY, allowNull: true },
    referenceNumber: { type: DataTypes.STRING, allowNull: true },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM("draft", "sent", "accepted", "converted", "cancelled"), defaultValue: "draft" },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "sales_quotations", timestamps: true });

module.exports = SalesQuotation;
