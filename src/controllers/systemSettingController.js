const service = require("../services/systemSettingService");

const getSettings = async (req, res) => {
    try { res.json(await service.getSettings()); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

const updateSettings = async (req, res) => {
    try { res.json(await service.updateSettings(req.body)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { getSettings, updateSettings };
