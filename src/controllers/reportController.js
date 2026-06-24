const reportService = require("../services/reportService");

const send = (method) => async (req, res) => {
    try { res.json(await reportService[method](req.query)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = {
    getGeneralLedger: send("getGeneralLedger"),
    getAccountStatement: send("getAccountStatement"),
    getTrialBalance: send("getTrialBalance"),
    getSalesReport: send("getSalesReport"),
    getPurchasesReport: send("getPurchasesReport"),
    getInventoryReport: send("getInventoryReport"),
    getInventoryMovementReport: send("getInventoryMovementReport"),
    getProductsByCategory: send("getProductsByCategory"),
    getCustomersReport: send("getCustomersReport"),
    getSuppliersReport: send("getSuppliersReport"),
    getVouchersReport: send("getVouchersReport")
};
