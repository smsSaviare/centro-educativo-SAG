require("dotenv").config();

const app = require("./app"); // ✅ app.js está en la misma carpeta que server.js
const sequelize = require("./config/database"); // ✅ config/database.js
const User = require("./models/User"); // ✅ models/User.js
const bcrypt = require("bcryptjs");

async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // crea/actualiza tablas automáticamente
    console.log("✅ Tablas sincronizadas en la DB");

    // Crear usuario admin inicial si no existe
    const adminEmail = "admin@saviare.com";
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log("✅ Usuario administrador creado");
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor online en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
}

startServer();
