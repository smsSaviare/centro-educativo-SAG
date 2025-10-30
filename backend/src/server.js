// server.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const sequelize = require("./config/database");
const User = require("./models/User");
const clerkWebhookRouter = require("./src/routes/clerkWebhook.js");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const app = express();
app.use(express.json());

// ✅ Webhook de Clerk (para crear usuarios en DB al registrarse)
app.use("/api", clerkWebhookRouter);

// ✅ Endpoint para sincronizar el usuario actual de Clerk con la DB
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name } = req.auth.user;
    const email = email_addresses?.[0]?.email_address || "sin_email@correo.com";

    const [user, created] = await User.findOrCreate({
      where: { clerk_id: id },
      defaults: {
        email,
        first_name,
        last_name,
        role: "student", // rol por defecto
      },
    });

    if (!created) {
      await user.update({ email, first_name, last_name });
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

// ✅ Sincronizar la base de datos y crear el admin por defecto
async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas en la base de datos");

    const adminEmail = "admin@saviare.com";
    const adminExists = await User.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await User.create({
        first_name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: "teacher", // o "admin" si quieres un rol superior
      });
      console.log("✅ Usuario administrador creado");
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor online en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
}

startServer();
