const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentMethod = sequelize.define("PaymentMethod", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM("CASH", "BANK", "CHECK", "CARD", "OTHER"), allowNull: false, defaultValue: "CASH" },
  accountId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "payment_methods", timestamps: true });

module.exports = PaymentMethod;
