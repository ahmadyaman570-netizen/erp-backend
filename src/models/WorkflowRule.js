const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkflowRule = sequelize.define("WorkflowRule", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  documentType: { type: DataTypes.STRING, allowNull: false },
  fromStatus: { type: DataTypes.STRING, allowNull: false },
  toStatus: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "workflow_rules", timestamps: true });

module.exports = WorkflowRule;
