const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NotificationRule = sequelize.define("NotificationRule", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  eventKey: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  channel: { type: DataTypes.ENUM("SYSTEM", "EMAIL", "WHATSAPP"), allowNull: false, defaultValue: "SYSTEM" },
  targetRoleId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: "notification_rules", timestamps: true });

module.exports = NotificationRule;
