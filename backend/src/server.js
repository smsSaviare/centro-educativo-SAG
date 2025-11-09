// backend/src/server.js
require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
const User = require("./models/UserModel");

async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Base de datos sincronizada");

    // Crear admin por defecto si no existe
    const adminEmail = "admin@saviare.com";
    const [admin, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        clerkId: "admin_default",
        email: adminEmail,
        firstName: "Administrador",
        lastName: "Sistema",
        role: "admin",
      },
    });

    if (created) console.log("✅ Usuario administrador creado");
    else console.log("ℹ️ Usuario administrador ya existía");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
}

startServer();
