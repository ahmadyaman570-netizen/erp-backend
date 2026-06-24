
const { Op } = require("sequelize");
const { Supplier, Account, JournalEntryLine } = require("../models");
const { ensureDefaultAccountingSetup } = require("./defaultAccountingSetupService");

const pad = (n) => String(n).padStart(3, "0");
const supplier = "supplier";
const ACCOUNTS_PAYABLE = "ACCOUNTS_PAYABLE";
const supplierType = "supplierType";

const generateCode = async (parentId) => {
    if (parentId) {
        const parent = await Supplier.findByPk(parentId);
        if (!parent) throw new Error(`Parent ${supplier} not found`);
        const count = await Supplier.count({ where: { parentId } });
        return `${parent.code || parent.id}-${pad(count + 1)}`;
    }
    return String((await Supplier.count({ where: { parentId: null } })) + 1);
};

const createLinkedAccount = async (data, entityCode, transaction) => {
    const cache = await ensureDefaultAccountingSetup();
    const parentAccount = cache[ACCOUNTS_PAYABLE];
    if (!parentAccount) return null;
    const count = await Account.count({ where: { parentId: parentAccount.id }, transaction });
    const account = await Account.create({
        code: `${parentAccount.code}-${pad(count + 1)}`,
        name: data.name,
        nameEn: data.nameEn || null,
        type: parentAccount.type,
        parentId: parentAccount.id,
        level: Number(parentAccount.level || 1) + 1,
        isActive: true,
        isSystem: false,
        systemKey: null
    }, { transaction });
    return account.id;
};

const createRow = async (data) => {
    const sequelize = Supplier.sequelize;
    const transaction = await sequelize.transaction();
    try {
        const parentId = data.parentId || null;
        let level = 1;
        if (parentId) {
            const parent = await Supplier.findByPk(parentId, { transaction });
            if (!parent) throw new Error(`Parent ${supplier} not found`);
            level = Number(parent.level || 1) + 1;
        }
        const code = data.code || await generateCode(parentId);
        const accountId = data.accountId || (data.supplierType === "GROUP" ? null : await createLinkedAccount(data, code, transaction));
        const row = await Supplier.create({ ...data, code, parentId, level, accountId, isActive: data.isActive ?? true }, { transaction });
        await transaction.commit();
        return row;
    } catch (e) { await transaction.rollback(); throw e; }
};


const getAccountBalance = async (accountId) => {
    if (!accountId) return 0;
    const lines = await JournalEntryLine.findAll({ where: { accountId } });
    return lines.reduce((sum, line) => sum + Number(line.debit || 0) - Number(line.credit || 0), 0);
};

const getRows = async ({ search = "", page = 1, limit = 1000, onlyLeaves = false } = {}) => {
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { code: { [Op.like]: `%${search}%` } }, { phone: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { taxNumber: { [Op.like]: `%${search}%` } }];
    if (onlyLeaves === true || onlyLeaves === "true") where.supplierType = { [Op.ne]: "GROUP" };
    const { rows, count } = await Supplier.findAndCountAll({
        where,
        include: [{ model: Account, as: "account", attributes: ["id", "code", "name", "type"] }],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        order: [["code", "ASC"], ["createdAt", "ASC"]]
    });
    const decorated = [];
    for (const row of rows) {
        const plain = row.toJSON();
        plain.accountBalance = await getAccountBalance(plain.accountId);
        decorated.push(plain);
    }
    return { suppliers: decorated, totalSuppliers: count, currentPage: Number(page), totalPages: Math.ceil(count / Number(limit)) };
};
const getRowById = async (id) => { const row = await Supplier.findByPk(id); if (!row) throw new Error(`${supplier} not found`); return row; };
const updateRow = async (id, data) => { const row = await getRowById(id); await row.update(data); if (row.accountId && data.name) { const account = await Account.findByPk(row.accountId); if (account) await account.update({ name: data.name, nameEn: data.nameEn || account.nameEn }); } return row; };
const deleteRow = async (id) => { const children = await Supplier.count({ where: { parentId: id } }); if (children) throw new Error(`Cannot delete ${supplier} that has child records`); const row = await getRowById(id); await row.destroy(); return { message: `${supplier} deleted successfully` }; };

module.exports = { createSupplier: createRow, getSuppliers: getRows, getSupplierById: getRowById, updateSupplier: updateRow, deleteSupplier: deleteRow };
