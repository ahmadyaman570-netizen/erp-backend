const User = require("./User");
const Customer = require("./Customer");
const Role = require("./Role");
const Permission = require("./Permission");
const Category = require("./Category");
const Product = require("./Product");
const Warehouse = require("./Warehouse");
const Inventory = require("./Inventory");
const InventoryTransaction = require("./InventoryTransaction");
const Supplier = require("./Supplier");
const PurchaseInvoice = require("./PurchaseInvoice");
const PurchaseInvoiceItem = require("./PurchaseInvoiceItem");
const SalesInvoice = require("./SalesInvoice");
const SalesInvoiceItem = require("./SalesInvoiceItem");
const Account = require("./Account");
const JournalEntry = require("./JournalEntry");
const JournalEntryLine = require("./JournalEntryLine");
const AccountingSetting = require("./AccountingSetting");
const ReceiptVoucher = require("./ReceiptVoucher");
const PaymentVoucher = require("./PaymentVoucher");
const PurchaseOrder = require("./PurchaseOrder");
const PurchaseOrderItem = require("./PurchaseOrderItem");
const SalesQuotation = require("./SalesQuotation");
const SalesQuotationItem = require("./SalesQuotationItem");
const AuditLog = require("./AuditLog");
const SystemSetting = require("./SystemSetting");
const CustomField = require("./CustomField");
const NumberingSequence = require("./NumberingSequence");
const PrintTemplate = require("./PrintTemplate");
const PaymentMethod = require("./PaymentMethod");
const Check = require("./Check");
const WorkflowRule = require("./WorkflowRule");

const Branch = require("./Branch");
const Department = require("./Department");
const CostCenter = require("./CostCenter");
const Currency = require("./Currency");
const TaxRule = require("./TaxRule");
const PriceList = require("./PriceList");
const NotificationRule = require("./NotificationRule");
const Attachment = require("./Attachment");

Role.hasMany(User, {
    foreignKey: "roleId"
});

User.belongsTo(Role, {
    foreignKey: "roleId"
});

Role.belongsToMany(Permission, {
    through: "role_permissions",
    foreignKey: "roleId",
    otherKey: "permissionId"
});

Permission.belongsToMany(Role, {
    through: "role_permissions",
    foreignKey: "permissionId",
    otherKey: "roleId"
});


Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });
Category.hasMany(Category, { as: "children", foreignKey: "parentId" });

Department.belongsTo(Department, { as: "parent", foreignKey: "parentId" });
Department.hasMany(Department, { as: "children", foreignKey: "parentId" });
CostCenter.belongsTo(CostCenter, { as: "parent", foreignKey: "parentId" });
CostCenter.hasMany(CostCenter, { as: "children", foreignKey: "parentId" });
Branch.hasMany(CostCenter, { foreignKey: "branchId" });
CostCenter.belongsTo(Branch, { foreignKey: "branchId" });
TaxRule.belongsTo(Account, { as: "account", foreignKey: "accountId" });
NotificationRule.belongsTo(Role, { as: "targetRole", foreignKey: "targetRoleId" });

Customer.belongsTo(Customer, { as: "parent", foreignKey: "parentId" });
Customer.hasMany(Customer, { as: "children", foreignKey: "parentId" });
Supplier.belongsTo(Supplier, { as: "parent", foreignKey: "parentId" });
Supplier.hasMany(Supplier, { as: "children", foreignKey: "parentId" });
Customer.belongsTo(Account, { as: "account", foreignKey: "accountId" });
Supplier.belongsTo(Account, { as: "account", foreignKey: "accountId" });

Category.hasMany(Product, {
    foreignKey: "categoryId"
});

Product.belongsTo(Category, {
    foreignKey: "categoryId"
});
Product.hasMany(Inventory, {
    foreignKey: "productId"
});

Inventory.belongsTo(Product, {
    foreignKey: "productId"
});

Warehouse.hasMany(Inventory, {
    foreignKey: "warehouseId"
});

Inventory.belongsTo(Warehouse, {
    foreignKey: "warehouseId"
});

Product.hasMany(InventoryTransaction, {
    foreignKey: "productId"
});

InventoryTransaction.belongsTo(Product, {
    foreignKey: "productId"
});

Warehouse.hasMany(InventoryTransaction, {
    foreignKey: "warehouseId"
});

InventoryTransaction.belongsTo(Warehouse, {
    foreignKey: "warehouseId"
});

Supplier.hasMany(PurchaseInvoice, {
    foreignKey: "supplierId"
});

PurchaseInvoice.belongsTo(Supplier, {
    foreignKey: "supplierId"
});

Warehouse.hasMany(PurchaseInvoice, {
    foreignKey: "warehouseId"
});

PurchaseInvoice.belongsTo(Warehouse, {
    foreignKey: "warehouseId"
});

PurchaseInvoice.hasMany(PurchaseInvoiceItem, {
    foreignKey: "purchaseInvoiceId"
});

PurchaseInvoiceItem.belongsTo(PurchaseInvoice, {
    foreignKey: "purchaseInvoiceId"
});

Product.hasMany(PurchaseInvoiceItem, {
    foreignKey: "productId"
});

PurchaseInvoiceItem.belongsTo(Product, {
    foreignKey: "productId"
});

Customer.hasMany(SalesInvoice, {
    foreignKey: "customerId"
});

SalesInvoice.belongsTo(Customer, {
    foreignKey: "customerId"
});

Warehouse.hasMany(SalesInvoice, {
    foreignKey: "warehouseId"
});

SalesInvoice.belongsTo(Warehouse, {
    foreignKey: "warehouseId"
});

SalesInvoice.hasMany(SalesInvoiceItem, {
    foreignKey: "salesInvoiceId"
});

SalesInvoiceItem.belongsTo(SalesInvoice, {
    foreignKey: "salesInvoiceId"
});

Product.hasMany(SalesInvoiceItem, {
    foreignKey: "productId"
});

SalesInvoiceItem.belongsTo(Product, {
    foreignKey: "productId"
});
Account.belongsTo(Account, {
    as: "parent",
    foreignKey: "parentId"
});

Account.hasMany(Account, {
    as: "children",
    foreignKey: "parentId"
});
JournalEntry.hasMany(JournalEntryLine, {
    foreignKey: "journalEntryId",
    as: "lines"
});

JournalEntryLine.belongsTo(JournalEntry, {
    foreignKey: "journalEntryId"
});

Account.hasMany(JournalEntryLine, {
    foreignKey: "accountId"
});

JournalEntryLine.belongsTo(Account, {
    foreignKey: "accountId",
    as: "account"
});
AccountingSetting.belongsTo(Account, {
    as: "inventoryAccount",
    foreignKey: "inventoryAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "accountsReceivableAccount",
    foreignKey: "accountsReceivableAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "accountsPayableAccount",
    foreignKey: "accountsPayableAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "salesRevenueAccount",
    foreignKey: "salesRevenueAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "costOfGoodsSoldAccount",
    foreignKey: "costOfGoodsSoldAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "cashAccount",
    foreignKey: "cashAccountId"
});

AccountingSetting.belongsTo(Account, {
    as: "bankAccount",
    foreignKey: "bankAccountId"
});

Customer.hasMany(ReceiptVoucher, {
    foreignKey: "customerId"
});

ReceiptVoucher.belongsTo(Customer, {
    foreignKey: "customerId"
});

Supplier.hasMany(PaymentVoucher, {
    foreignKey: "supplierId"
});

PaymentVoucher.belongsTo(Supplier, {
    foreignKey: "supplierId"
});


Supplier.hasMany(PurchaseOrder, { foreignKey: "supplierId" });
PurchaseOrder.belongsTo(Supplier, { foreignKey: "supplierId" });
Warehouse.hasMany(PurchaseOrder, { foreignKey: "warehouseId" });
PurchaseOrder.belongsTo(Warehouse, { foreignKey: "warehouseId" });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "purchaseOrderId" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
Product.hasMany(PurchaseOrderItem, { foreignKey: "productId" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "productId" });
PurchaseOrder.hasMany(PurchaseInvoice, { foreignKey: "purchaseOrderId" });
PurchaseInvoice.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

Customer.hasMany(SalesQuotation, { foreignKey: "customerId" });
SalesQuotation.belongsTo(Customer, { foreignKey: "customerId" });
Warehouse.hasMany(SalesQuotation, { foreignKey: "warehouseId" });
SalesQuotation.belongsTo(Warehouse, { foreignKey: "warehouseId" });
SalesQuotation.hasMany(SalesQuotationItem, { foreignKey: "salesQuotationId" });
SalesQuotationItem.belongsTo(SalesQuotation, { foreignKey: "salesQuotationId" });
Product.hasMany(SalesQuotationItem, { foreignKey: "productId" });
SalesQuotationItem.belongsTo(Product, { foreignKey: "productId" });
SalesQuotation.hasMany(SalesInvoice, { foreignKey: "salesQuotationId" });
SalesInvoice.belongsTo(SalesQuotation, { foreignKey: "salesQuotationId" });

PaymentMethod.belongsTo(Account, { as: "account", foreignKey: "accountId" });
Account.hasMany(PaymentMethod, { foreignKey: "accountId" });
WorkflowRule.belongsTo(Role, { as: "role", foreignKey: "roleId" });
Role.hasMany(WorkflowRule, { foreignKey: "roleId" });

module.exports = {
    User,
    Customer,
    Role,
    Permission,
    Category,
    Product,
    Warehouse,
    Inventory,
    InventoryTransaction,
    Supplier,
    PurchaseInvoice,
    PurchaseInvoiceItem,
    SalesInvoice,
    SalesInvoiceItem,
    Account,
    JournalEntry,
    JournalEntryLine,
    AccountingSetting,
    ReceiptVoucher,
    PaymentVoucher,
    PurchaseOrder,
    PurchaseOrderItem,
    SalesQuotation,
    SalesQuotationItem,
    SystemSetting,
    AuditLog,
    CustomField,
    NumberingSequence,
    PrintTemplate,
    PaymentMethod,
    Check,
    WorkflowRule,
    Branch,
    Department,
    CostCenter,
    Currency,
    TaxRule,
    PriceList,
    NotificationRule,
    Attachment
};