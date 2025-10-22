require("dotenv").config();
const sequelize = require("./src/config/database");
const User = require("./src/models/User");

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas correctamente");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al sincronizar tablas:", err);
    process.exit(1);
  }
}

syncDatabase();
