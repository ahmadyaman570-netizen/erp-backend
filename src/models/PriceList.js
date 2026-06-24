const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PriceList = sequelize.define("PriceList", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("SALES", "PURCHASES"), allowNull: false, defaultValue: "SALES" },
  currencyCode: { type: DataTypes.STRING, allowNull: false, defaultValue: "JOD" },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "price_lists", timestamps: true });

module.exports = PriceList;
