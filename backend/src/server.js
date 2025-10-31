// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/UserModel");
const clerkWebhookRouter = require("./routes/clerkWebhook");
const { ClerkExpressRequireAuth, clerkClient } = require("@clerk/clerk-sdk-node");
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const app = express();

// ✅ CORS configurado para GitHub Pages y entorno local
const allowedOrigins = [
  "https://smssaviare.github.io", // frontend en producción
  "http://localhost:5173",        // entorno local
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Webhook de Clerk (sincroniza nuevos usuarios automáticamente)
app.use("/api/webhooks", clerkWebhookRouter);

// ✅ Sincroniza manualmente el usuario logueado con la base de datos
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Usuario no autenticado" });
    }

    // Recuperar información del usuario desde Clerk
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress || "sin_email@correo.com";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    // Crear o actualizar el usuario en la base de datos
    const [dbUser, created] = await User.findOrCreate({
      where: { clerkId: userId },
      defaults: {
        clerkId: userId,
        email,
        firstName,
        lastName,
        role: "student",
      },
    });

    if (!created) {
      await dbUser.update({ email, firstName, lastName });
    }

    res.json({
      success: true,
      message: created ? "Usuario creado correctamente" : "Usuario actualizado",
      user: dbUser,
    });
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "🚀 API Saviare funcionando correctamente con Clerk" });
});

// ✅ Sincronizar DB y crear administrador por defecto
async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Base de datos sincronizada");

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
    app.listen(PORT, () => console.log(`🚀 Servidor en línea en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
}

startServer();
