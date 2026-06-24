const accountingSettingService = require("../services/accountingSettingService");

const getAccountingSettings = async (req, res) => {
    try {
        const settings =
            await accountingSettingService.getAccountingSettings();

        res.json(settings);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const upsertAccountingSettings = async (req, res) => {
    try {
        const settings =
            await accountingSettingService.upsertAccountingSettings(req.body);

        res.json({
            message: "Accounting settings saved successfully",
            settings
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    getAccountingSettings,
    upsertAccountingSettings
};