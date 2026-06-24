const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { User, Role } = require("../models");

const cleanUser = (user) => {
    const json = user.toJSON ? user.toJSON() : user;
    delete json.password;
    return json;
};

const getUsers = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 100 } = req.query;
        const where = {};
        if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = await User.findAndCountAll({ where, include: [{ model: Role }], limit: Number(limit), offset, order: [["createdAt", "DESC"]] });
        res.json({ users: rows.map(cleanUser), totalUsers: count, currentPage: Number(page), totalPages: Math.ceil(count / Number(limit)) });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;
        if (!name || !email || !password) throw new Error("Name, email and password are required");
        const exists = await User.findOne({ where: { email } });
        if (exists) throw new Error("Email already exists");
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, roleId: roleId || null });
        res.status(201).json({ message: "User created successfully", user: cleanUser(user) });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new Error("User not found");
        const payload = { name: req.body.name ?? user.name, email: req.body.email ?? user.email, roleId: req.body.roleId ?? user.roleId };
        if (req.body.password) payload.password = await bcrypt.hash(req.body.password, 10);
        await user.update(payload);
        res.json({ message: "User updated successfully", user: cleanUser(user) });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new Error("User not found");
        await user.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
