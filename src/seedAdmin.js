require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./config/database");
const { User, Role } = require("./models");

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();

        let role = await Role.findOne({
            where: { name: "Super Admin" }
        });

        if (!role) {
            role = await Role.create({
                name: "Super Admin"
            });
        }

        const hashedPassword = await bcrypt.hash("123456", 10);

        await User.create({
            name: "Admin",
            email: "admin@erp.com",
            password: hashedPassword,
            roleId: role.id
        });

        console.log("Admin created successfully");
        console.log("Email: admin@erp.com");
        console.log("Password: 123456");

        process.exit();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
seedAdmin();