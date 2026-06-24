const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NumberingSequence = sequelize.define("NumberingSequence", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  documentType: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  prefix: { type: DataTypes.STRING, allowNull: false },
  nextNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  padding: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
  includeYear: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  numberSeparator: { type: DataTypes.STRING, allowNull: false, defaultValue: "-" },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "numbering_sequences", timestamps: true });

module.exports = NumberingSequence;
