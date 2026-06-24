    const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentVoucher = sequelize.define("PaymentVoucher", {
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    voucherNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },

    paymentMethod: {
        type: DataTypes.ENUM("CASH", "BANK", "CHECK"),
        allowNull: false
    },

    checkNumber: { type: DataTypes.STRING, allowNull: true },
    bankName: { type: DataTypes.STRING, allowNull: true },
    checkDueDate: { type: DataTypes.DATEONLY, allowNull: true },
    checkStatus: { type: DataTypes.ENUM("ISSUED", "CLEARED", "RETURNED"), allowNull: true },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, { tableName: "payment_vouchers", timestamps: true });

module.exports = PaymentVoucher;