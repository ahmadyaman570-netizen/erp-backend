const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Currency = sequelize.define("Currency", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: true },
  exchangeRate: { type: DataTypes.DECIMAL(15, 6), allowNull: false, defaultValue: 1 },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "currencies", timestamps: true });

module.exports = Currency;
