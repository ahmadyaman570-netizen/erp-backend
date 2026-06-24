const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PrintTemplate = sequelize.define("PrintTemplate", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  documentType: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  paperSize: { type: DataTypes.ENUM("A4", "A5", "LETTER"), allowNull: false, defaultValue: "A4" },
  orientation: { type: DataTypes.ENUM("PORTRAIT", "LANDSCAPE"), allowNull: false, defaultValue: "PORTRAIT" },
  showLogo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  showTaxNumber: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  showSignature: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  showStamp: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  primaryColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#1d4ed8" },
  notes: { type: DataTypes.TEXT, allowNull: true },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "print_templates", timestamps: true });

module.exports = PrintTemplate;
