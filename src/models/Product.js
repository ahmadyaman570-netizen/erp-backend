const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "Product",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        nameEn: { type: DataTypes.STRING, allowNull: true },
        sku: { type: DataTypes.STRING, allowNull: false, unique: true },
        isbn: { type: DataTypes.STRING, allowNull: true, unique: true },
        barcode: { type: DataTypes.STRING, allowNull: true },
        costPrice: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
        salePrice: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
        priceBeforeTax: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
        priceAfterTax: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0 },
        discountPercent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
        taxPercent: { type: DataTypes.DECIMAL(6, 3), allowNull: false, defaultValue: 0 },
        unit: { type: DataTypes.STRING, allowNull: true, defaultValue: "قطعة" },
        productType: { type: DataTypes.ENUM("STOCK", "SERVICE", "RAW", "FINISHED"), allowNull: false, defaultValue: "STOCK" },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        categoryId: { type: DataTypes.INTEGER, allowNull: false }
    },
    { tableName: "products", timestamps: true }
);

module.exports = Product;
