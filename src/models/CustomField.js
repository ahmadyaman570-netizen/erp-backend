const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CustomField = sequelize.define("CustomField", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  entity: { type: DataTypes.STRING, allowNull: false },
  label: { type: DataTypes.STRING, allowNull: false },
  fieldKey: { type: DataTypes.STRING, allowNull: false },
  fieldType: { type: DataTypes.ENUM("TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "TEXTAREA"), allowNull: false, defaultValue: "TEXT" },
  options: { type: DataTypes.TEXT, allowNull: true },
  isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: "custom_fields", timestamps: true, indexes: [{ unique: true, fields: ["entity", "fieldKey"] }] });

module.exports = CustomField;
