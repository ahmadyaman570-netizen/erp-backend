const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesInvoiceItem = sequelize.define("SalesInvoiceItem", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    salesInvoiceId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(12, 3), allowNull: false },
    priceBeforeTax: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
    discountPercent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
    discountAmount: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
    taxPercent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
    priceAfterTax: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 3), allowNull: false }
}, { tableName: "sales_invoice_items", timestamps: true });

module.exports = SalesInvoiceItem;
