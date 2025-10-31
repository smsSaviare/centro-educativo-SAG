require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ClerkExpressRequireAuth } = require("@clerk/backend");
const app = express();

// Middleware base
app.use(cors());
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
