require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");
const User = require("./src/models/User");

async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // crea/actualiza tablas automáticamente
    console.log("✅ Tablas sincronizadas en la DB");

    // Crear usuario admin inicial si no existe
    const adminEmail = "admin@saviare.com";
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("admin123", 10);
      await User.create({ name: "Administrador", email: adminEmail, passwordHash, role: "admin" });
      console.log("✅ Usuario administrador creado");
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Servidor online en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
}

startServer();
