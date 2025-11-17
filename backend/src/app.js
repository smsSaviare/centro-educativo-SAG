// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ClerkExpressRequireAuth, Clerk } = require("@clerk/backend");

const app = express();

// 🔧 Configura CORS para permitir tu dominio de GitHub Pages
app.use(cors({
  origin: [
    "http://localhost:5173",               // para desarrollo local
    "https://smssaviare.github.io"         // tu dominio en producción
  ],
  credentials: true
}));

// Inicializa Clerk con tu secret key
const clerkClient = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// Middleware base
//app.use(cors());
app.use(express.json());

// Nueva ruta: sesión de desarrollo
app.post("/api/dev-session", async (req, res) => {
  try {
    const userId = "user_34TWX7M13fgqVw9cYoYgcfotRNP"; // tu userId real
    const session = await clerkClient.sessions.create({ userId });
    res.json({ token: session.id });
  } catch (err) {
    console.error("❌ Error creando sesión de prueba:", err);
    res.status(500).json({ error: "No se pudo crear sesión de prueba" });
  }
});

app.use("/api/webhooks", require("./routes/clerkWebhook"));
app.use("/api/courses", require("./routes/courses"));

// Rutas públicas (no requieren sesión)
app.get("/", (req, res) => {
  res.json({ mensaje: "¡Bienvenido a la API de Saviare con Clerk!" });
});

// Ejemplo de ruta protegida
app.get("/api/secure-data", ClerkExpressRequireAuth(), (req, res) => {
  res.json({
    mensaje: "Accediste a datos protegidos 🎯",
    usuario: req.auth.userId,
  });
});

// 🔧 Nueva ruta: sesión de desarrollo
app.post("/api/dev-session", async (req, res) => {
  try {
    // ⚠️ Usa un userId real de Clerk (ejemplo: el tuyo de prueba)
    const userId = "user_123"; // reemplaza con el ID de tu usuario en Clerk

    const session = await clerkClient.sessions.create({ userId });
    res.json({ token: session.id });
  } catch (err) {
    console.error("❌ Error creando sesión de prueba:", err);
    res.status(500).json({ error: "No se pudo crear sesión de prueba" });
  }
});

// Importa tus rutas actuales
const authRoutes = require("./routes/authRoutes");
const coursesRoutes = require("./routes/courses");
const quizRoutes = require("./routes/quiz");
const usersRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;
