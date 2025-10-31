// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const sequelize = require("./config/database");
const User = require("./models/UserModel");
const clerkWebhookRouter = require("./routes/clerkWebhook");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const app = express();

// ==========================
// 🌐 CONFIGURACIÓN DE CORS
// ==========================
const allowedOrigins = [
  "https://smssaviare.github.io", // Frontend en GitHub Pages
  "http://localhost:5173",        // Entorno local
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-clerk-id",
      "x-requested-with",
    ],
    credentials: true,
  })
);

// 🧩 FIX para Express 5 — manejar preflight requests correctamente
app.options(/.*/, cors());

app.use(express.json());

// ===================================
// 🔔 RUTA DE WEBHOOK DE CLERK
// ===================================
app.use("/api", clerkWebhookRouter);

// ===================================
// 🔄 SINCRONIZAR USUARIO DE CLERK CON DB
// ===================================
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

// ===================================
// 🧱 INICIO DEL SERVIDOR Y BASE DE DATOS
// ===================================
async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // ⚠️ Usa { force: false } o { alter: true } en producción
    console.log("✅ Tablas sincronizadas con la base de datos");

    // Crear usuario administrador por defecto si no existe
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
    app.listen(PORT, () =>
      console.log(`🚀 Servidor online en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
}

startServer();
