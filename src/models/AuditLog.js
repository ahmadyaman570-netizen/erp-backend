const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    userName: { type: DataTypes.STRING, allowNull: true },
    method: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    module: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: true },
    statusCode: { type: DataTypes.INTEGER, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    body: { type: DataTypes.TEXT("long"), allowNull: true }
}, { tableName: "audit_logs", timestamps: true });

module.exports = AuditLog;
