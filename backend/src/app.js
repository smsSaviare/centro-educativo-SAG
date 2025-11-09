// backend/src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ClerkExpressRequireAuth } = require("@clerk/backend");
const app = express();

// Middleware base
app.use(express.json());
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

// 🔹 Importa tus rutas existentes (las que realmente tienes)
const authRoutes = require("./routes/authRoutes");
const coursesRoutes = require("./routes/courses");
const usersRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;
