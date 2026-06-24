const bcrypt = require("bcrypt");
const {
  Role, Permission, User, NumberingSequence, PrintTemplate, PaymentMethod,
  CustomField, WorkflowRule, SystemSetting, Account, Branch, Department, CostCenter,
  Currency, TaxRule, PriceList, NotificationRule
} = require("../models");

const roles = [
  "مدير النظام العام",
  "مدير النظام",
  "المدير المالي",
  "مدير المحاسبة",
  "مدير المبيعات",
  "مدير المشتريات",
  "مدير المخازن",
  "مدير الموارد البشرية",
  "مدير المشاريع",
  "مدقق داخلي",
  "محاسب",
  "مندوب مبيعات",
  "أمين مستودع",
  "مستخدم"
];

// أسماء الصلاحيات داخلية برمجياً، وواجهات النظام تعرضها بالعربية.
const permissions = [
  "view_dashboard", "manage_accounts", "manage_customers", "manage_suppliers",
  "manage_products", "manage_inventory", "manage_purchases", "manage_sales",
  "view_reports", "manage_reports", "manage_users", "manage_settings",
  "manage_payments", "manage_vouchers", "manage_checks", "approve_documents",
  "print_documents", "export_excel", "import_excel", "view_audit_logs",
  "manage_branches", "manage_departments", "manage_cost_centers", "manage_currencies",
  "manage_tax_rules", "manage_price_lists", "manage_workflows", "manage_print_templates",
  "manage_custom_fields", "manage_notifications", "view_account_statement",
  "view_customer_statement", "view_supplier_statement", "manage_attachments",
  "close_financial_periods", "manage_budgets", "manage_fixed_assets", "manage_hr",
  "manage_projects", "manage_manufacturing", "manage_quality", "manage_crm",
  "manage_assets", "manage_payroll", "manage_contracts", "manage_maintenance",
  "manage_documents", "manage_cashflow", "manage_banks", "manage_reconciliation"
];

const numbering = [
  ["sales_invoice", "فاتورة مبيعات", "فم"],
  ["purchase_invoice", "فاتورة مشتريات", "فش"],
  ["sales_quotation", "عرض سعر", "عس"],
  ["purchase_order", "طلب شراء", "طش"],
  ["receipt_voucher", "سند قبض", "سق"],
  ["payment_voucher", "سند صرف", "سص"],
  ["journal_entry", "قيد يومية", "قي"],
  ["customer", "عميل", "عم"],
  ["supplier", "مورد", "مو"],
  ["product", "مادة", "ما"],
  ["check", "شيك", "شك"],
  ["sales_return", "مرتجع مبيعات", "رم"],
  ["purchase_return", "مرتجع مشتريات", "رش"],
  ["inventory_transfer", "تحويل مخزني", "تح"],
  ["stock_adjustment", "تسوية مخزون", "تس"],
  ["fixed_asset", "أصل ثابت", "أص"],
  ["budget", "موازنة", "مز"],
  ["project", "مشروع", "مش"],
  ["employee", "موظف", "وظ"],
  ["contract", "عقد", "عق"],
  ["maintenance", "صيانة", "صي"],
  ["manufacturing_order", "أمر تصنيع", "تص"],
  ["quality_check", "فحص جودة", "جو"]
];

const printTypes = [
  ["sales_invoice", "فاتورة مبيعات"], ["purchase_invoice", "فاتورة مشتريات"],
  ["sales_quotation", "عرض سعر"], ["purchase_order", "طلب شراء"],
  ["receipt_voucher", "سند قبض"], ["payment_voucher", "سند صرف"],
  ["check", "شيك"], ["journal_entry", "قيد يومية"]
];

async function seedRolesAndPermissions() {
  const roleRows = {};
  for (const name of roles) {
    const [role] = await Role.findOrCreate({ where: { name }, defaults: { name } });
    roleRows[name] = role;
  }
  for (const name of permissions) {
    await Permission.findOrCreate({ where: { name }, defaults: { name } });
  }
  const masterRole = roleRows["مدير النظام العام"] || roleRows["مدير النظام"];
  const allPermissions = await Permission.findAll();
  if (masterRole) await masterRole.setPermissions(allPermissions);
}

async function seedAdmin() {
  const masterRole = await Role.findOne({ where: { name: "مدير النظام العام" } });
  const exists = await User.findOne({ where: { email: "admin@erp.com" } });
  if (!exists && masterRole) {
    await User.create({
      name: "مدير النظام",
      email: "admin@erp.com",
      password: await bcrypt.hash("123456", 10),
      roleId: masterRole.id
    });
  } else if (exists && masterRole) {
    await exists.update({ name: exists.name === "Admin" ? "مدير النظام" : exists.name, roleId: masterRole.id });
  }
}

async function seedSystemSettings() {
  const defaults = {
    companyName: "اسم المؤسسة",
    taxNumber: "000000000",
    address: "العنوان الرئيسي",
    phone: "0000000000",
    currency: "د.أ",
    defaultTaxPercent: 16,
    invoiceFooter: "شكراً لتعاملكم معنا",
    logoUrl: ""
  };
  const existing = await SystemSetting.findOne();
  if (!existing) await SystemSetting.create(defaults);
}

async function seedNumberingAndPrinting() {
  for (const [documentType, title, prefix] of numbering) {
    await NumberingSequence.findOrCreate({
      where: { documentType },
      defaults: { documentType, title, prefix, nextNumber: 1, padding: 5, includeYear: true, numberSeparator: "-", isActive: true }
    });
  }
  for (const [documentType, name] of printTypes) {
    await PrintTemplate.findOrCreate({
      where: { documentType, name: `${name} حجم أ٤` },
      defaults: { documentType, name: `${name} حجم أ٤`, paperSize: "A4", orientation: "PORTRAIT", isDefault: true }
    });
  }
}

async function seedPaymentMethods() {
  const cash = await Account.findOne({ where: { systemKey: "cash" } });
  const bank = await Account.findOne({ where: { systemKey: "bank" } });
  const methods = [
    { name: "نقدي", type: "CASH", accountId: cash?.id || null },
    { name: "تحويل بنكي", type: "BANK", accountId: bank?.id || null },
    { name: "شيك", type: "CHECK", accountId: bank?.id || null },
    { name: "بطاقة دفع", type: "CARD", accountId: bank?.id || null },
    { name: "محفظة إلكترونية", type: "OTHER", accountId: bank?.id || null }
  ];
  for (const method of methods) await PaymentMethod.findOrCreate({ where: { name: method.name }, defaults: method });
}

async function seedCustomFields() {
  const fields = [
    ["customers", "منطقة العميل", "customerRegion", "TEXT"],
    ["customers", "مندوب المبيعات", "salesman", "TEXT"],
    ["customers", "حد الائتمان", "creditLimit", "NUMBER"],
    ["suppliers", "نوع التوريد", "supplyType", "TEXT"],
    ["suppliers", "مدة السداد", "paymentTerm", "NUMBER"],
    ["products", "الماركة", "brand", "TEXT"],
    ["products", "الموديل", "model", "TEXT"],
    ["products", "رقم الرف", "shelfNo", "TEXT"],
    ["sales_invoices", "رقم أمر العميل", "customerOrderNo", "TEXT"],
    ["purchase_invoices", "رقم بوليصة الشحن", "shippingNo", "TEXT"]
  ];
  for (const [entity, label, fieldKey, fieldType] of fields) {
    await CustomField.findOrCreate({ where: { entity, fieldKey }, defaults: { entity, label, fieldKey, fieldType } });
  }
}

async function seedEnterpriseFoundation() {
  const defaults = {
    branches: [
      { code: "001", name: "الإدارة العامة", city: "عمان", isMain: true },
      { code: "002", name: "فرع المبيعات الرئيسي", city: "عمان" }
    ],
    departments: [
      { code: "001", name: "الإدارة المالية" },
      { code: "002", name: "إدارة المبيعات" },
      { code: "003", name: "إدارة المشتريات" },
      { code: "004", name: "إدارة المخازن" },
      { code: "005", name: "تقنية المعلومات" },
      { code: "006", name: "الموارد البشرية" },
      { code: "007", name: "إدارة المشاريع" }
    ],
    costCenters: [
      { code: "001", name: "الإدارة العامة" },
      { code: "002", name: "المبيعات" },
      { code: "003", name: "المشتريات" },
      { code: "004", name: "المخازن" },
      { code: "005", name: "التسويق" },
      { code: "006", name: "الصيانة" },
      { code: "007", name: "المشاريع" }
    ],
    currencies: [
      { code: "001", name: "دينار أردني", symbol: "د.أ", exchangeRate: 1, isDefault: true },
      { code: "002", name: "دولار أمريكي", symbol: "$", exchangeRate: 0.709 },
      { code: "003", name: "ريال سعودي", symbol: "ر.س", exchangeRate: 0.189 }
    ],
    taxRules: [
      { code: "001", name: "ضريبة مبيعات 16%", rate: 16, appliesTo: "BOTH", isDefault: true },
      { code: "002", name: "معفى من الضريبة", rate: 0, appliesTo: "BOTH" }
    ],
    priceLists: [
      { code: "001", name: "سعر بيع افتراضي", type: "SALES", currencyCode: "001", isDefault: true },
      { code: "002", name: "سعر شراء افتراضي", type: "PURCHASES", currencyCode: "001", isDefault: true }
    ],
    notifications: [
      { eventKey: "low_stock", title: "تنبيه انخفاض المخزون" },
      { eventKey: "check_due", title: "تنبيه استحقاق شيك" },
      { eventKey: "invoice_overdue", title: "تنبيه فاتورة مستحقة" },
      { eventKey: "approval_required", title: "طلب اعتماد جديد" }
    ]
  };
  for (const row of defaults.branches) await Branch.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.departments) await Department.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.costCenters) await CostCenter.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.currencies) await Currency.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.taxRules) await TaxRule.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.priceLists) await PriceList.findOrCreate({ where: { code: row.code }, defaults: row });
  for (const row of defaults.notifications) await NotificationRule.findOrCreate({ where: { eventKey: row.eventKey }, defaults: row });
}

async function seedWorkflowRules() {
  const masterRole = await Role.findOne({ where: { name: "مدير النظام العام" } });
  const docTypes = ["sales_invoice", "purchase_invoice", "sales_quotation", "purchase_order", "receipt_voucher", "payment_voucher", "check", "journal_entry"];
  for (const documentType of docTypes) {
    for (const [fromStatus, toStatus] of [["مسودة", "معتمد"], ["معتمد", "مرحل"], ["معتمد", "ملغي"]]) {
      await WorkflowRule.findOrCreate({ where: { documentType, fromStatus, toStatus }, defaults: { documentType, fromStatus, toStatus, roleId: masterRole?.id || null } });
    }
  }
}

async function runProfessionalSeeders() {
  await seedRolesAndPermissions();
  await seedAdmin();
  await seedSystemSettings();
  await seedNumberingAndPrinting();
  await seedPaymentMethods();
  await seedCustomFields();
  await seedWorkflowRules();
  await seedEnterpriseFoundation();
}

module.exports = { runProfessionalSeeders };
