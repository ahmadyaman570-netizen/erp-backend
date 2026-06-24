const { Role } = require("../models");
const getRoles = async (req, res) => {
    try { res.json({ roles: await Role.findAll({ order: [["id", "ASC"]] }) }); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
module.exports = { getRoles };
