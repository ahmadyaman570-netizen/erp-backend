const {
    Customer,
    Supplier,
    Product,
    Warehouse,
    Inventory,
    SalesInvoice,
    SalesInvoiceItem,
    PurchaseInvoice,
    Product: ProductModel
} = require("../models");

const getMonthName = (monthIndex) => {
    const months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر"
    ];

    return months[monthIndex];
};

const getLastSixMonths = () => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        result.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            label: getMonthName(date.getMonth()),
            year: date.getFullYear(),
            month: date.getMonth()
        });
    }

    return result;
};

const getDashboardSummary = async () => {
    const [
        customersCount,
        suppliersCount,
        productsCount,
        warehousesCount,
        salesInvoices,
        purchaseInvoices,
        inventoryRows,
        salesItems
    ] = await Promise.all([
        Customer.count(),
        Supplier.count(),
        Product.count(),
        Warehouse.count(),
        SalesInvoice.findAll(),
        PurchaseInvoice.findAll(),
        Inventory.findAll({
            include: [
                {
                    model: ProductModel,
                    attributes: ["id", "name", "sku", "costPrice"]
                }
            ]
        }),
        SalesInvoiceItem.findAll({
            include: [
                {
                    model: ProductModel,
                    attributes: ["id", "name", "sku"]
                }
            ]
        })
    ]);

    const totalSales = salesInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalAmount || 0),
        0
    );

    const totalPurchases = purchaseInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalAmount || 0),
        0
    );

    const inventoryValue = inventoryRows.reduce((sum, row) => {
        const quantity = Number(row.quantity || 0);
        const costPrice = Number(row.Product?.costPrice || 0);

        return sum + quantity * costPrice;
    }, 0);

    const profit = totalSales - totalPurchases;

    const months = getLastSixMonths();

    const monthlyData = months.map((month) => {
        const sales = salesInvoices
            .filter((invoice) => {
                const date = new Date(invoice.createdAt);
                return (
                    date.getFullYear() === month.year &&
                    date.getMonth() === month.month
                );
            })
            .reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);

        const purchases = purchaseInvoices
            .filter((invoice) => {
                const date = new Date(invoice.createdAt);
                return (
                    date.getFullYear() === month.year &&
                    date.getMonth() === month.month
                );
            })
            .reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);

        return {
            month: month.label,
            sales,
            purchases
        };
    });

    const productMap = {};

    for (const item of salesItems) {
        const productId = item.productId;

        if (!productMap[productId]) {
            productMap[productId] = {
                productId,
                name: item.Product?.name || "منتج غير معروف",
                quantity: 0
            };
        }

        productMap[productId].quantity += Number(item.quantity || 0);
    }

    const topProducts = Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const lowStock = inventoryRows
        .filter((row) => Number(row.quantity || 0) <= 5)
        .map((row) => ({
            productId: row.productId,
            name: row.Product?.name || "منتج غير معروف",
            quantity: Number(row.quantity || 0)
        }))
        .slice(0, 5);

    return {
        cards: {
            totalSales,
            totalPurchases,
            customersCount,
            suppliersCount,
            productsCount,
            warehousesCount,
            inventoryValue,
            profit
        },
        charts: {
            monthlyData,
            topProducts
        },
        alerts: {
            lowStock
        }
    };
};

module.exports = {
    getDashboardSummary
};