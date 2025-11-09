// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ClerkExpressRequireAuth, clerkClient } = require("@clerk/clerk-sdk-node");
const User = require("./models/UserModel");

// Rutas
const clerkWebhookRouter = require("./routes/clerkWebhook");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courses");
const quizRoutes = require("./routes/quiz");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ CORS: desarrollo y producción
const allowedOrigins = [
  "https://smssaviare.github.io", // frontend producción
  "http://localhost:5173",        // frontend local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `CORS bloquea el origen no autorizado: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-clerk-id",
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

// Log de peticiones (opcional, útil para depuración)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// 🌐 Rutas principales
app.use("/api/users", userRoutes);
app.use("/api/webhooks", clerkWebhookRouter);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quiz", quizRoutes);

// 🔐 Sincronización de usuario Clerk → Base de datos
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, error: "Usuario no autenticado" });

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
      message: created ? "Usuario creado correctamente" : "Usuario actualizado",
      user: dbUser,
    });
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta pública de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "🚀 API Saviare funcionando correctamente con Clerk" });
});

module.exports = app;
