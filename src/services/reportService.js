const { Op } = require("sequelize");

const {
    Account,
    JournalEntry,
    JournalEntryLine,
    SalesInvoice,
    SalesInvoiceItem,
    PurchaseInvoice,
    PurchaseInvoiceItem,
    Customer,
    Supplier,
    Product,
    Category,
    Inventory,
    InventoryTransaction,
    Warehouse,
    ReceiptVoucher,
    PaymentVoucher
} = require("../models");

const buildDateWhere = ({ fromDate, toDate } = {}) => {
    const where = {};
    if (fromDate || toDate) {
        where.date = {};
        if (fromDate) where.date[Op.gte] = fromDate;
        if (toDate) where.date[Op.lte] = toDate;
    }
    return where;
};

const num = (value) => Number(value || 0);

const getLinkedAccountBalance = async (accountId) => {
    if (!accountId) return 0;
    const lines = await JournalEntryLine.findAll({ where: { accountId } });
    return lines.reduce((sum, line) => sum + num(line.debit) - num(line.credit), 0);
};


const getGeneralLedger = async (filters) => {
    const { accountId, fromDate, toDate } = filters;

    if (!accountId) throw new Error("accountId is required");

    const account = await Account.findByPk(accountId);
    if (!account) throw new Error("Account not found");

    const journalWhere = buildDateWhere({ fromDate, toDate });

    const lines = await JournalEntryLine.findAll({
        where: { accountId },
        include: [
            { model: JournalEntry, where: journalWhere },
            { model: Account, as: "account" }
        ],
        order: [[JournalEntry, "date", "ASC"], [JournalEntry, "id", "ASC"], ["id", "ASC"]]
    });

    let runningBalance = 0;

    const rows = lines.map((line) => {
        const debit = num(line.debit);
        const credit = num(line.credit);
        runningBalance += debit - credit;
        return {
            التاريخ: line.JournalEntry.date,
            "رقم القيد": line.JournalEntry.entryNumber,
            البيان: line.JournalEntry.description,
            مدين: debit,
            دائن: credit,
            الرصيد: runningBalance
        };
    });

    return {
        title: `كشف حساب ${account.code} - ${account.name}`,
        rows,
        totals: {
            "إجمالي المدين": rows.reduce((s, r) => s + num(r["مدين"]), 0),
            "إجمالي الدائن": rows.reduce((s, r) => s + num(r["دائن"]), 0),
            "الرصيد": runningBalance
        },
        meta: { accountId: account.id, code: account.code, name: account.name, type: account.type }
    };
};

const getAccountStatement = async (filters) => getGeneralLedger(filters);

const getTrialBalance = async (filters) => {
    const journalWhere = buildDateWhere(filters);
    const accounts = await Account.findAll({ where: { isActive: true }, order: [["code", "ASC"]] });
    const rows = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const account of accounts) {
        const lines = await JournalEntryLine.findAll({
            where: { accountId: account.id },
            include: [{ model: JournalEntry, where: journalWhere }]
        });

        const debit = lines.reduce((sum, line) => sum + num(line.debit), 0);
        const credit = lines.reduce((sum, line) => sum + num(line.credit), 0);
        const balance = debit - credit;

        if (debit > 0 || credit > 0) {
            rows.push({
                "رقم الحساب": account.code,
                "اسم الحساب": account.name,
                "النوع": account.type,
                "مدين": debit,
                "دائن": credit,
                "الرصيد": balance
            });
        }

        totalDebit += debit;
        totalCredit += credit;
    }

    return {
        title: "ميزان المراجعة",
        rows,
        totals: {
            "إجمالي المدين": totalDebit,
            "إجمالي الدائن": totalCredit,
            "الفرق": totalDebit - totalCredit,
            "متوازن": totalDebit === totalCredit ? "نعم" : "لا"
        }
    };
};

const getSalesReport = async ({ fromDate, toDate } = {}) => {
    const where = buildDateWhere({ fromDate, toDate });
    const invoices = await SalesInvoice.findAll({
        where,
        include: [
            { model: Customer, attributes: ["id", "code", "name", "accountId"] },
            { model: SalesInvoiceItem, include: [{ model: Product, attributes: ["id", "sku", "isbn", "name"] }] }
        ],
        order: [["date", "DESC"], ["id", "DESC"]]
    });

    const rows = invoices.map((r) => ({
        "التاريخ": r.date,
        "رقم الفاتورة": r.invoiceNumber,
        "العميل": r.Customer?.name || "-",
        "عدد المواد": r.SalesInvoiceItems?.length || 0,
        "الخصم": num(r.discountAmount),
        "الضريبة": num(r.taxAmount),
        "الإجمالي": num(r.totalAmount),
        "الحالة": r.status || "-"
    }));

    return { title: "تقرير المبيعات", rows, totals: { "عدد الفواتير": rows.length, "إجمالي المبيعات": rows.reduce((s, r) => s + num(r["الإجمالي"]), 0), "إجمالي الضريبة": rows.reduce((s, r) => s + num(r["الضريبة"]), 0) } };
};

const getPurchasesReport = async ({ fromDate, toDate } = {}) => {
    const where = buildDateWhere({ fromDate, toDate });
    const invoices = await PurchaseInvoice.findAll({
        where,
        include: [
            { model: Supplier, attributes: ["id", "code", "name", "accountId"] },
            { model: PurchaseInvoiceItem, include: [{ model: Product, attributes: ["id", "sku", "isbn", "name"] }] }
        ],
        order: [["date", "DESC"], ["id", "DESC"]]
    });

    const rows = invoices.map((r) => ({
        "التاريخ": r.date,
        "رقم الفاتورة": r.invoiceNumber,
        "المورد": r.Supplier?.name || "-",
        "عدد المواد": r.PurchaseInvoiceItems?.length || 0,
        "الخصم": num(r.discountAmount),
        "الضريبة": num(r.taxAmount),
        "الإجمالي": num(r.totalAmount),
        "الحالة": r.status || "-"
    }));

    return { title: "تقرير المشتريات", rows, totals: { "عدد الفواتير": rows.length, "إجمالي المشتريات": rows.reduce((s, r) => s + num(r["الإجمالي"]), 0), "إجمالي الضريبة": rows.reduce((s, r) => s + num(r["الضريبة"]), 0) } };
};

const getInventoryReport = async () => {
    const rowsRaw = await Inventory.findAll({ include: [{ model: Product, include: [{ model: Category }] }, { model: Warehouse }], order: [["productId", "ASC"]] });
    const rows = rowsRaw.map((r) => ({
        "المستودع": r.Warehouse?.name || "-",
        "التصنيف": r.Product?.Category?.name || "بدون تصنيف",
        "SKU": r.Product?.sku || "-",
        "ISBN": r.Product?.isbn || "-",
        "المادة": r.Product?.name || "-",
        "الكمية": num(r.quantity),
        "تكلفة الوحدة": num(r.Product?.costPrice),
        "قيمة المخزون": num(r.quantity) * num(r.Product?.costPrice)
    }));
    return { title: "تقرير المخزون", rows, totals: { "عدد السطور": rows.length, "قيمة المخزون": rows.reduce((s, r) => s + num(r["قيمة المخزون"]), 0) } };
};

const getInventoryMovementReport = async ({ fromDate, toDate } = {}) => {
    const where = buildDateWhere({ fromDate, toDate });
    const movements = await InventoryTransaction.findAll({
        where,
        include: [{ model: Product }, { model: Warehouse }],
        order: [["createdAt", "DESC"], ["id", "DESC"]]
    });
    const rows = movements.map((m) => ({
        "التاريخ": m.createdAt,
        "المستودع": m.Warehouse?.name || "-",
        "المادة": m.Product?.name || "-",
        "SKU": m.Product?.sku || "-",
        "نوع الحركة": m.type,
        "الكمية": num(m.quantity),
        "ملاحظة": m.note || "-"
    }));
    return { title: "تقرير حركة المخزون", rows, totals: { "عدد الحركات": rows.length, "إجمالي الداخل": rows.filter(r => r["نوع الحركة"] === "IN").reduce((s,r)=>s+num(r["الكمية"]),0), "إجمالي الخارج": rows.filter(r => r["نوع الحركة"] === "OUT").reduce((s,r)=>s+num(r["الكمية"]),0) } };
};

const getProductsByCategory = async () => {
    const categories = await Category.findAll({ order: [["code", "ASC"], ["name", "ASC"]] });
    const products = await Product.findAll({ include: [{ model: Category }], order: [["categoryId", "ASC"], ["name", "ASC"]] });
    const rows = [];
    categories.forEach((category) => {
        products.filter((product) => Number(product.categoryId) === Number(category.id)).forEach((product) => {
            rows.push({
                "التصنيف": `${category.code || ""} ${category.name}`.trim(),
                "SKU": product.sku,
                "ISBN": product.isbn || "-",
                "اسم المادة": product.name,
                "النوع": product.productType,
                "سعر الشراء": num(product.costPrice),
                "سعر البيع": num(product.salePrice),
                "الضريبة %": num(product.taxPercent),
                "الخصم %": num(product.discountPercent),
                "الحالة": product.isActive ? "نشط" : "غير نشط"
            });
        });
    });
    return { title: "المواد حسب شجرة المواد", rows, totals: { "عدد التصنيفات": categories.length, "عدد المواد": products.length } };
};

const getCustomersReport = async () => {
    const customers = await Customer.findAll({ include: [{ model: Account, as: "account" }], order: [["code", "ASC"], ["name", "ASC"]] });
    const rows = [];
    for (const c of customers) {
        const balance = await getLinkedAccountBalance(c.accountId);
        rows.push({
            "الكود": c.code || c.id,
            "الاسم": c.name,
            "النوع": c.customerType === "GROUP" ? "مجموعة" : c.customerType,
            "الحساب المحاسبي": c.account ? `${c.account.code} - ${c.account.name}` : "غير مربوط",
            "الهاتف": c.phone || "-",
            "الرقم الضريبي": c.taxNumber || "-",
            "الرصيد المحاسبي": balance,
            "الحالة": c.isActive ? "نشط" : "غير نشط"
        });
    }
    return { title: "تقرير العملاء وربطهم بالحسابات", rows, totals: { "عدد العملاء": rows.length, "إجمالي الأرصدة": rows.reduce((s, r) => s + num(r["الرصيد المحاسبي"]), 0), "غير مربوطين": rows.filter(r => r["الحساب المحاسبي"] === "غير مربوط").length } };
};

const getSuppliersReport = async () => {
    const suppliers = await Supplier.findAll({ include: [{ model: Account, as: "account" }], order: [["code", "ASC"], ["name", "ASC"]] });
    const rows = [];
    for (const s of suppliers) {
        const balance = await getLinkedAccountBalance(s.accountId);
        rows.push({
            "الكود": s.code || s.id,
            "الاسم": s.name,
            "النوع": s.supplierType === "GROUP" ? "مجموعة" : s.supplierType,
            "الحساب المحاسبي": s.account ? `${s.account.code} - ${s.account.name}` : "غير مربوط",
            "الهاتف": s.phone || "-",
            "الرقم الضريبي": s.taxNumber || "-",
            "الرصيد المحاسبي": balance,
            "الحالة": s.isActive ? "نشط" : "غير نشط"
        });
    }
    return { title: "تقرير الموردين وربطهم بالحسابات", rows, totals: { "عدد الموردين": rows.length, "إجمالي الأرصدة": rows.reduce((sum, r) => sum + num(r["الرصيد المحاسبي"]), 0), "غير مربوطين": rows.filter(r => r["الحساب المحاسبي"] === "غير مربوط").length } };
};

const getVouchersReport = async ({ fromDate, toDate } = {}) => {
    const where = buildDateWhere({ fromDate, toDate });
    const receipts = await ReceiptVoucher.findAll({ where, include: [{ model: Customer }], order: [["date", "DESC"]] });
    const payments = await PaymentVoucher.findAll({ where, include: [{ model: Supplier }], order: [["date", "DESC"]] });
    const rows = [
        ...receipts.map((v) => ({ "النوع": "سند قبض", "التاريخ": v.date, "الرقم": v.voucherNumber, "الطرف": v.Customer?.name || "-", "طريقة الدفع": v.paymentMethod, "المبلغ": num(v.amount), "الوصف": v.note || "-" })),
        ...payments.map((v) => ({ "النوع": "سند صرف", "التاريخ": v.date, "الرقم": v.voucherNumber, "الطرف": v.Supplier?.name || "-", "طريقة الدفع": v.paymentMethod, "المبلغ": num(v.amount), "الوصف": v.note || "-" }))
    ].sort((a, b) => String(b["التاريخ"]).localeCompare(String(a["التاريخ"])));
    return { title: "تقرير السندات", rows, totals: { "عدد السندات": rows.length, "إجمالي القبض": rows.filter(r => r["النوع"] === "سند قبض").reduce((s,r)=>s+num(r["المبلغ"]),0), "إجمالي الصرف": rows.filter(r => r["النوع"] === "سند صرف").reduce((s,r)=>s+num(r["المبلغ"]),0) } };
};

module.exports = {
    getGeneralLedger,
    getAccountStatement,
    getTrialBalance,
    getSalesReport,
    getPurchasesReport,
    getInventoryReport,
    getInventoryMovementReport,
    getProductsByCategory,
    getCustomersReport,
    getSuppliersReport,
    getVouchersReport
};
