const { AuditLog } = require("../models");

const methodToAction = { POST: "CREATE", PUT: "UPDATE", PATCH: "UPDATE", DELETE: "DELETE" };

function safeBody(body) {
    const clone = { ...(body || {}) };
    if (clone.password) clone.password = "***";
    try { return JSON.stringify(clone).slice(0, 10000); } catch { return null; }
}

function auditMiddleware(req, res, next) {
    const shouldLog = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (!shouldLog) return next();
    res.on("finish", async () => {
        try {
            await AuditLog.create({
                userId: req.user?.id || null,
                userName: req.user?.name || req.user?.email || null,
                method: req.method,
                path: req.originalUrl,
                module: req.originalUrl.split("/").filter(Boolean)[0] || null,
                action: methodToAction[req.method] || req.method,
                statusCode: res.statusCode,
                ip: req.ip,
                body: safeBody(req.body)
            });
        } catch (error) {
            console.error("Audit log failed:", error.message);
        }
    });
    next();
}

module.exports = auditMiddleware;
