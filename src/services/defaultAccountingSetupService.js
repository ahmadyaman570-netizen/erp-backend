const { Account, AccountingSetting, Customer, Supplier } = require("../models");

const DEFAULT_ACCOUNTS = [
    { code: "1", name: "الموجودات", nameEn: "assets", type: "ASSET", level: 1, systemKey: "ASSETS" },
    { code: "1-1", name: "الموجودات المتداولة", nameEn: "Current Assets", type: "ASSET", parent: "ASSETS", level: 2, systemKey: "CURRENT_ASSETS" },
    { code: "1-1-1", name: "النقدية وما بحكمها", nameEn: "Cash", type: "ASSET", parent: "CURRENT_ASSETS", level: 3, systemKey: "CASH" },
    { code: "1-1-2", name: "البنوك", nameEn: "Banks", type: "ASSET", parent: "CURRENT_ASSETS", level: 3, systemKey: "BANK" },
    { code: "1-1-3", name: "العملاء", nameEn: "Accounts Receivable", type: "ASSET", parent: "CURRENT_ASSETS", level: 3, systemKey: "ACCOUNTS_RECEIVABLE" },
    { code: "1-1-4", name: "المخزون", nameEn: "Inventory", type: "ASSET", parent: "CURRENT_ASSETS", level: 3, systemKey: "INVENTORY" },
    { code: "1-1-5", name: "مصروفات مدفوعة مقدماً", nameEn: "Prepaid Expenses", type: "ASSET", parent: "CURRENT_ASSETS", level: 3, systemKey: "PREPAID_EXPENSES" },
    { code: "1-2", name: "الموجودات غير المتداولة", nameEn: "Non Current Assets", type: "ASSET", parent: "ASSETS", level: 2, systemKey: "NON_CURRENT_ASSETS" },
    { code: "1-2-1", name: "العقارات والآلات", nameEn: "Fixed Assets", type: "ASSET", parent: "NON_CURRENT_ASSETS", level: 3, systemKey: "FIXED_ASSETS" },

    { code: "2", name: "المطلوبات", nameEn: "liabilities", type: "LIABILITY", level: 1, systemKey: "LIABILITIES" },
    { code: "2-1", name: "المطلوبات المتداولة", nameEn: "Current Liabilities", type: "LIABILITY", parent: "LIABILITIES", level: 2, systemKey: "CURRENT_LIABILITIES" },
    { code: "2-1-1", name: "الموردون", nameEn: "Accounts Payable", type: "LIABILITY", parent: "CURRENT_LIABILITIES", level: 3, systemKey: "ACCOUNTS_PAYABLE" },
    { code: "2-1-2", name: "ضريبة مبيعات مستحقة", nameEn: "Sales Tax Payable", type: "LIABILITY", parent: "CURRENT_LIABILITIES", level: 3, systemKey: "SALES_TAX_PAYABLE" },

    { code: "3", name: "حقوق الملكية", nameEn: "equity", type: "EQUITY", level: 1, systemKey: "EQUITY" },
    { code: "3-1", name: "رأس المال", nameEn: "Capital", type: "EQUITY", parent: "EQUITY", level: 2, systemKey: "CAPITAL" },

    { code: "4", name: "الإيرادات", nameEn: "revenue", type: "REVENUE", level: 1, systemKey: "REVENUE" },
    { code: "4-1", name: "إيرادات المبيعات", nameEn: "Sales Revenue", type: "REVENUE", parent: "REVENUE", level: 2, systemKey: "SALES_REVENUE" },
    { code: "4-2", name: "خصم مسموح به", nameEn: "Sales Discount", type: "REVENUE", parent: "REVENUE", level: 2, systemKey: "SALES_DISCOUNT" },

    { code: "5", name: "المصروفات", nameEn: "expenses", type: "EXPENSE", level: 1, systemKey: "EXPENSES" },
    { code: "5-1", name: "تكلفة البضاعة المباعة", nameEn: "Cost Of Goods Sold", type: "EXPENSE", parent: "EXPENSES", level: 2, systemKey: "COGS" },
    { code: "5-2", name: "مصروفات عامة وإدارية", nameEn: "General Expenses", type: "EXPENSE", parent: "EXPENSES", level: 2, systemKey: "GENERAL_EXPENSES" }
];

const ensureAccount = async (item, cache) => {
    const parentId = item.parent ? cache[item.parent]?.id : null;
    const [account] = await Account.findOrCreate({
        where: { code: item.code },
        defaults: {
            code: item.code,
            name: item.name,
            nameEn: item.nameEn,
            type: item.type,
            parentId,
            level: item.level,
            isActive: true,
            isSystem: true,
            systemKey: item.systemKey
        }
    });

    const updates = {};
    if (!account.systemKey) updates.systemKey = item.systemKey;
    if (account.parentId !== parentId) updates.parentId = parentId;
    if (account.level !== item.level) updates.level = item.level;
    if (!account.isSystem) updates.isSystem = true;
    if (Object.keys(updates).length) await account.update(updates);

    cache[item.systemKey] = account;
    return account;
};


const pad = (n) => String(n).padStart(3, "0");

const createChildAccountIfMissing = async ({ parentAccount, name, nameEn, transaction }) => {
    const count = await Account.count({ where: { parentId: parentAccount.id }, transaction });
    return await Account.create({
        code: `${parentAccount.code}-${pad(count + 1)}`,
        name,
        nameEn: nameEn || null,
        type: parentAccount.type,
        parentId: parentAccount.id,
        level: Number(parentAccount.level || 1) + 1,
        isActive: true,
        isSystem: false,
        systemKey: null
    }, { transaction });
};

const ensurePartyAccounts = async (cache) => {
    const sequelize = Account.sequelize;
    const transaction = await sequelize.transaction();
    try {
        const customerParent = cache.ACCOUNTS_RECEIVABLE;
        const supplierParent = cache.ACCOUNTS_PAYABLE;

        if (customerParent) {
            const customers = await Customer.findAll({
                where: { accountId: null, customerType: ["INDIVIDUAL", "COMPANY"] },
                transaction
            });
            for (const customer of customers) {
                const account = await createChildAccountIfMissing({
                    parentAccount: customerParent,
                    name: customer.name,
                    nameEn: customer.nameEn,
                    transaction
                });
                await customer.update({ accountId: account.id }, { transaction });
            }
        }

        if (supplierParent) {
            const suppliers = await Supplier.findAll({
                where: { accountId: null, supplierType: ["INDIVIDUAL", "COMPANY"] },
                transaction
            });
            for (const supplier of suppliers) {
                const account = await createChildAccountIfMissing({
                    parentAccount: supplierParent,
                    name: supplier.name,
                    nameEn: supplier.nameEn,
                    transaction
                });
                await supplier.update({ accountId: account.id }, { transaction });
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const ensureDefaultAccountingSetup = async () => {
    const cache = {};
    for (const item of DEFAULT_ACCOUNTS) {
        await ensureAccount(item, cache);
    }

    const payload = {
        inventoryAccountId: cache.INVENTORY.id,
        accountsReceivableAccountId: cache.ACCOUNTS_RECEIVABLE.id,
        accountsPayableAccountId: cache.ACCOUNTS_PAYABLE.id,
        salesRevenueAccountId: cache.SALES_REVENUE.id,
        costOfGoodsSoldAccountId: cache.COGS.id,
        cashAccountId: cache.CASH.id,
        bankAccountId: cache.BANK.id
    };

    const existing = await AccountingSetting.findOne();
    if (!existing) await AccountingSetting.create(payload);
    await ensurePartyAccounts(cache);
    return cache;
};

module.exports = { ensureDefaultAccountingSetup, DEFAULT_ACCOUNTS, ensurePartyAccounts };
