const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SystemSetting = sequelize.define("SystemSetting", {
    companyName: { type: DataTypes.STRING, allowNull: false, defaultValue: "اسم الشركة" },
    taxNumber: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
    printTitleColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#0f172a" },
    printAccentColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#2563eb" },
    showLogo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    showTaxNumber: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    invoiceFooter: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: "system_settings", timestamps: true });

module.exports = SystemSetting;
