const { Op } = require("sequelize");
const { AuditLog } = require("../models");

const getAuditLogs = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 100 } = req.query;
        const where = {};
        if (search) {
            where[Op.or] = [
                { userName: { [Op.like]: `%${search}%` } },
                { path: { [Op.like]: `%${search}%` } },
                { module: { [Op.like]: `%${search}%` } },
                { action: { [Op.like]: `%${search}%` } }
            ];
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = await AuditLog.findAndCountAll({ where, limit: Number(limit), offset, order: [["createdAt", "DESC"]] });
        res.json({ auditLogs: rows, total: count, currentPage: Number(page), totalPages: Math.ceil(count / Number(limit)) });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
module.exports = { getAuditLogs };
