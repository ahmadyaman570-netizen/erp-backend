const { Role, Permission } = require("../models");

const permissionMiddleware = (permissionName) => {
    return async (req, res, next) => {
        try {
            const roleId = req.user?.roleId;

            if (!roleId) {
                return res.status(403).json({ message: "المستخدم غير مرتبط بأي دور" });
            }

            const role = await Role.findByPk(roleId, {
                include: [{ model: Permission, through: { attributes: [] } }]
            });

            if (!role) {
                // حماية عملية أثناء التطوير: الدور رقم 1 هو مدير النظام الكامل.
                if (Number(roleId) === 1) return next();
                return res.status(403).json({ message: "الدور غير موجود" });
            }

            if (["مدير النظام العام", "مدير النظام", "Super Admin"].includes(role.name)) return next();

            const permissions = role.Permissions || [];
            const hasPermission = permissions.some((permission) => permission.name === permissionName);

            if (!hasPermission) {
                return res.status(403).json({ message: "لا تملك صلاحية الوصول" });
            }

            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = permissionMiddleware;
