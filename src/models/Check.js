const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Check = sequelize.define("Check", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  direction: { type: DataTypes.ENUM("IN", "OUT"), allowNull: false },
  checkNumber: { type: DataTypes.STRING, allowNull: false },
  bankName: { type: DataTypes.STRING, allowNull: true },
  ownerName: { type: DataTypes.STRING, allowNull: true },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 3), allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM("معلق", "محصل", "مصروف", "مرتجع", "ملغى"), allowNull: false, defaultValue: "معلق" },
  sourceType: { type: DataTypes.STRING, allowNull: true },
  sourceId: { type: DataTypes.INTEGER, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "checks", timestamps: true });

module.exports = Check;
