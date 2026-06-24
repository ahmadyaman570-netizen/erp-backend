const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attachment = sequelize.define("Attachment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  entityType: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.INTEGER, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "attachments", timestamps: true });

module.exports = Attachment;
