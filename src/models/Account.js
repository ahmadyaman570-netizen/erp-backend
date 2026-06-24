const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Account = sequelize.define("Account", {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    nameEn: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.ENUM("ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"), allowNull: false },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
    systemKey: { type: DataTypes.STRING, allowNull: true, unique: true }
}, {
    tableName: "accounts",
    timestamps: true
});

module.exports = Account;
