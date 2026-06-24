const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PurchaseOrder = sequelize.define("PurchaseOrder", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    supplierId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: true },
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    expectedDate: { type: DataTypes.DATEONLY, allowNull: true },
    referenceNumber: { type: DataTypes.STRING, allowNull: true },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM("draft", "approved", "converted", "cancelled"), defaultValue: "draft" },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "purchase_orders", timestamps: true });

module.exports = PurchaseOrder;
