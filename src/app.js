const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes"); 
const warehouseRoutes = require("./routes/warehouseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseInvoiceRoutes = require("./routes/purchaseInvoiceRoutes");
const salesInvoiceRoutes = require("./routes/salesInvoiceRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const salesQuotationRoutes = require("./routes/salesQuotationRoutes");
const accountRoutes = require("./routes/accountRoutes");
const journalEntryRoutes = require("./routes/journalEntryRoutes");
const accountingSettingRoutes = require("./routes/accountingSettingRoutes");
const receiptVoucherRoutes = require("./routes/receiptVoucherRoutes");
const paymentVoucherRoutes = require("./routes/paymentVoucherRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const systemSettingRoutes = require("./routes/systemSettingRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const auditMiddleware = require("./middlewares/auditMiddleware");
const app = express();

app.use(cors());
app.use(express.json());
app.use(auditMiddleware);

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/warehouses", warehouseRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/purchase-orders", purchaseOrderRoutes);
app.use("/purchase-invoices", purchaseInvoiceRoutes);
app.use("/sales-quotations", salesQuotationRoutes);
app.use("/sales-invoices", salesInvoiceRoutes);
app.use("/accounts", accountRoutes);
app.use("/journal-entries", journalEntryRoutes);
app.use("/accounting-settings", accountingSettingRoutes);
app.use("/receipt-vouchers", receiptVoucherRoutes);
app.use("/payment-vouchers", paymentVoucherRoutes);
app.use("/reports", reportRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/system-settings", systemSettingRoutes);
app.use("/customization", customizationRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "ERP API is running"
    });
});

module.exports = app;

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json({
        message: error.message || "Internal server error"
    });
});
