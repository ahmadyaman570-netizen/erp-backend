const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CostCenter = sequelize.define("CostCenter", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  parentId: { type: DataTypes.INTEGER, allowNull: true },
  branchId: { type: DataTypes.INTEGER, allowNull: true },
  budgetAmount: { type: DataTypes.DECIMAL(15, 3), allowNull: false, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "cost_centers", timestamps: true });

module.exports = CostCenter;
