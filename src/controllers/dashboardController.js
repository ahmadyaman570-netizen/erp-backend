const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res) => {
    try {
        const dashboard = await dashboardService.getDashboardSummary();

        res.json(dashboard);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    getDashboardSummary
};