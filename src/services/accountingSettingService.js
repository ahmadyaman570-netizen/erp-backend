const {
    AccountingSetting,
    Account
} = require("../models");

const validateAccount = async (accountId, name) => {
    const account = await Account.findByPk(accountId);

    if (!account) {
        throw new Error(`${name} account not found`);
    }

    return account;
};

const getAccountingSettings = async () => {
    const settings = await AccountingSetting.findOne({
        include: [
            { model: Account, as: "inventoryAccount" },
            { model: Account, as: "accountsReceivableAccount" },
            { model: Account, as: "accountsPayableAccount" },
            { model: Account, as: "salesRevenueAccount" },
            { model: Account, as: "costOfGoodsSoldAccount" },
            { model: Account, as: "cashAccount" },
            { model: Account, as: "bankAccount" }
        ]
    });

    if (!settings) {
        throw new Error("Accounting settings not configured");
    }

    return settings;
};

const upsertAccountingSettings = async (data) => {
    const {
        inventoryAccountId,
        accountsReceivableAccountId,
        accountsPayableAccountId,
        salesRevenueAccountId,
        costOfGoodsSoldAccountId,
        cashAccountId,
        bankAccountId
    } = data;

    await validateAccount(inventoryAccountId, "Inventory");
    await validateAccount(accountsReceivableAccountId, "Accounts Receivable");
    await validateAccount(accountsPayableAccountId, "Accounts Payable");
    await validateAccount(salesRevenueAccountId, "Sales Revenue");
    await validateAccount(costOfGoodsSoldAccountId, "Cost Of Goods Sold");
    await validateAccount(cashAccountId, "حساب الصندوق");
    await validateAccount(bankAccountId, "Bank");

    let settings = await AccountingSetting.findOne();

    const payload = {
        inventoryAccountId,
        accountsReceivableAccountId,
        accountsPayableAccountId,
        salesRevenueAccountId,
        costOfGoodsSoldAccountId,
        cashAccountId,
        bankAccountId
    };

    if (!settings) {
        settings = await AccountingSetting.create(payload);
    } else {
        await settings.update(payload);
    }

    return await getAccountingSettings();
};

module.exports = {
    getAccountingSettings,
    upsertAccountingSettings
};