const app = require("./src/app");
const sequelize = require("./src/config/database");
require("./src/models");
const { ensureDefaultAccountingSetup } = require("./src/services/defaultAccountingSetupService");
const { runProfessionalSeeders } = require("./src/seeders/professionalSeeder");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log("MySQL Connected Successfully");

        await sequelize.sync();

        console.log("Database synced successfully");

        await ensureDefaultAccountingSetup();
        await runProfessionalSeeders();
        console.log("Default accounting setup and professional seeders are ready");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
    }
};

startServer();