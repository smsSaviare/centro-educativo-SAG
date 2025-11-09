// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/UserModel");
const clerkWebhookRouter = require("./routes/clerkWebhook");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courses");
const { ClerkExpressRequireAuth, clerkClient } = require("@clerk/backend");

// Inicializar Express
const app = express();

// ✅ CORS robusto para producción y desarrollo
const allowedOrigins = [
  "https://smssaviare.github.io", // frontend producción
  "http://localhost:5173",        // frontend local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // permitir Postman, etc.
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS bloquea el origen ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-clerk-signature",
      "x-clerk-webhook-id",
      "x-clerk-webhook-signature",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware base
app.use(express.json());

// Log de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/webhooks", clerkWebhookRouter);
app.use("/courses", courseRoutes);

// 🔹 Sincronizar usuario Clerk ↔ BD
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId)
      return res.status(401).json({ success: false, error: "No autenticado" });

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress || "sin_email@correo.com";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    const [dbUser, created] = await User.findOrCreate({
      where: { clerkId: userId },
      defaults: { clerkId: userId, email, firstName, lastName, role: "student" },
    });

    if (!created) await dbUser.update({ email, firstName, lastName });

    res.json({
      success: true,
      message: created ? "Usuario creado" : "Usuario actualizado",
      user: dbUser,
    });
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "🚀 API Saviare funcionando correctamente con Clerk" });
});

// Iniciar servidor
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

    if (created) console.log("✅ Usuario admin creado");
    else console.log("ℹ️ Usuario admin ya existía");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () =>
      console.log(`🚀 Servidor en línea en puerto ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
  }
}

startServer();
