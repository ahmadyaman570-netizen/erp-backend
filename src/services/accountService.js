const { Op } = require("sequelize");
const { Account } = require("../models");

const ROOT_CODES = {
    ASSET: "1",
    LIABILITY: "2",
    EQUITY: "3",
    REVENUE: "4",
    EXPENSE: "5"
};

const pad = (number) => String(number).padStart(3, "0");

const generateAccountCode = async ({ type, parentId }) => {
    if (parentId) {
        const parent = await Account.findByPk(parentId);
        if (!parent) throw new Error("Parent account not found");

        const children = await Account.findAll({
            where: { parentId },
            order: [["code", "DESC"]]
        });

        let next = 1;
        if (children.length) {
            const lastSegment = String(children[0].code).split("-").pop();
            next = Number(lastSegment || 0) + 1;
        }

        return `${parent.code}-${pad(next)}`;
    }

    const baseCode = ROOT_CODES[type];
    if (!baseCode) throw new Error("Invalid account type");

    const roots = await Account.findAll({
        where: { parentId: null, type },
        order: [["code", "DESC"]]
    });

    if (!roots.length) return baseCode;
    return `${baseCode}-${pad(roots.length + 1)}`;
};

const createAccount = async (data) => {
    const parentId = data.parentId || null;
    let type = data.type;
    let level = 1;

    if (parentId) {
        const parent = await Account.findByPk(parentId);
        if (!parent) throw new Error("Parent account not found");
        type = parent.type;
        level = Number(parent.level || 1) + 1;
    }

    const existingName = await Account.findOne({ where: { name: data.name, parentId } });
    if (existingName) throw new Error("Account name already exists in the same level");

    const code = await generateAccountCode({ type, parentId });

    return await Account.create({
        code,
        name: data.name,
        nameEn: data.nameEn || null,
        type,
        parentId,
        level,
        isActive: data.isActive ?? true,
        isSystem: data.isSystem ?? false,
        systemKey: data.systemKey || null
    });
};

const getAccounts = async ({ search = "" }) => {
    const where = {};
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { nameEn: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } }
        ];
    }
    return await Account.findAll({ where, order: [["code", "ASC"]] });
};

const getAccountById = async (id) => {
    const account = await Account.findByPk(id);
    if (!account) throw new Error("Account not found");
    return account;
};

const updateAccount = async (id, data) => {
    const account = await getAccountById(id);
    await account.update({
        name: data.name,
        nameEn: data.nameEn ?? account.nameEn,
        isActive: data.isActive
    });
    return account;
};

const deleteAccount = async (id) => {
    const account = await getAccountById(id);
    if (account.isSystem) throw new Error("Cannot delete system account");

    const childrenCount = await Account.count({ where: { parentId: id } });
    if (childrenCount > 0) throw new Error("Cannot delete account that has child accounts");

    await account.destroy();
    return { message: "Account deleted successfully" };
};

module.exports = { createAccount, getAccounts, getAccountById, updateAccount, deleteAccount, generateAccountCode };
