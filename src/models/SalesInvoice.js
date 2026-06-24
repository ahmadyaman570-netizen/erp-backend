const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesInvoice = sequelize.define("SalesInvoice", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    salesQuotationId: { type: DataTypes.INTEGER, allowNull: true },
    invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    dueDate: { type: DataTypes.DATEONLY, allowNull: true },
    referenceNumber: { type: DataTypes.STRING, allowNull: true },
    sourceType: { type: DataTypes.STRING, allowNull: true },
    sourceId: { type: DataTypes.INTEGER, allowNull: true },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM("draft", "posted", "cancelled"), defaultValue: "posted" },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "sales_invoices", timestamps: true });

module.exports = SalesInvoice;
