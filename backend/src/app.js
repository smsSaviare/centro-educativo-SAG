// backend/src/app.js
require("dotenv").config();
const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/backend");
const app = express();

app.use(express.json());

// Webhooks Clerk
app.use("/api/webhooks", require("./routes/clerkWebhook"));

// Rutas públicas
app.get("/", (req, res) => {
  res.json({ mensaje: "¡Bienvenido a la API de Saviare con Clerk!" });
});

// Ruta protegida de prueba
app.get("/api/secure-data", ClerkExpressRequireAuth(), (req, res) => {
  res.json({
    mensaje: "Accediste a datos protegidos 🎯",
    usuario: req.auth.userId,
  });
});

// Importa rutas principales
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/users", require("./routes/users"));

module.exports = app;
