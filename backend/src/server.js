// backend/src/server.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const sequelize = require("./config/database"); // 👈 corregido
const User = require("./models/UserModel");     // 👈 corregido
const clerkWebhookRouter = require("./routes/clerkWebhook"); // 👈 corregido
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const app = express();
app.use(express.json());

// ✅ Webhook de Clerk (crea usuarios en la DB)
app.use("/api", clerkWebhookRouter);

// ✅ Endpoint para sincronizar el usuario actual de Clerk con la DB
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name } = req.auth.user;
    const email = email_addresses?.[0]?.email_address || "sin_email@correo.com";

    const [user, created] = await User.findOrCreate({
      where: { clerkId: id },
      defaults: {
        clerkId: id,
        email,
        firstName: first_name || "",
        lastName: last_name || "",
        role: "student",
      },
    });

    if (!created) {
      await user.update({
        email,
        firstName: first_name || "",
        lastName: last_name || "",
      });
    }

    res.json({
      success: true,
      message: created ? "Usuario creado" : "Usuario actualizado",
      user,
    });
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Sincronizar base de datos y crear admin
async function startServer() {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Tablas recreadas en la base de datos");

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

    if (created) {
      console.log("✅ Usuario administrador creado");
    } else {
      console.log("ℹ️ El usuario administrador ya existía");
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Servidor online en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
}

startServer();
