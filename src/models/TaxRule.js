const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaxRule = sequelize.define("TaxRule", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  rate: { type: DataTypes.DECIMAL(8, 3), allowNull: false, defaultValue: 0 },
  appliesTo: { type: DataTypes.ENUM("SALES", "PURCHASES", "BOTH"), allowNull: false, defaultValue: "BOTH" },
  accountId: { type: DataTypes.INTEGER, allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "tax_rules", timestamps: true });

module.exports = TaxRule;
