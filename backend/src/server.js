// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/UserModel");
const clerkWebhookRouter = require("./routes/clerkWebhook");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courses");
const { ClerkExpressRequireAuth, clerkClient } = require("@clerk/clerk-sdk-node");

// 🔹 Inicializar Express
const app = express();

// ✅ CORS robusto para producción y desarrollo
const allowedOrigins = [
  "https://smssaviare.github.io", // frontend producción
  "http://localhost:5173",        // frontend local
];

app.use(
  cors({
    origin: [
      "https://smssaviare.github.io",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Clerk-Id",
      "X-Clerk-Signature",
      "X-Clerk-Webhook-Id",
      "X-Clerk-Webhook-Signature",
      "x-clerk-id",
      "x-clerk-signature",
      "x-clerk-webhook-id",
      "x-clerk-webhook-signature",
    ],
    exposedHeaders: ["Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Respaldo: añadir cabeceras CORS y responder OPTIONS tempranamente
app.use((req, res, next) => {
  // Asegura que las respuestas de error también incluyan cabeceras CORS
  res.header("Access-Control-Allow-Origin", "https://smssaviare.github.io");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Clerk-Id, x-clerk-id"
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 🔹 Middleware para parsear JSON
app.use(express.json());

// 🔹 Middleware opcional de logging (útil para depuración)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// 🔹 Rutas
app.use("/api/users", userRoutes);
app.use("/api/webhooks", clerkWebhookRouter);
app.use("/courses", courseRoutes); // <-- aquí se monta el router

// 🔹 Endpoint para sincronizar usuario actual de Clerk
app.post("/sync-user", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ success: false, error: "Usuario no autenticado" });

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress || "sin_email@correo.com";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    // If worker mode is active, delegate user upsert to Worker (D1)
    if (process.env.WORKER_URL) {
      const workerClient = require('./utils/workerClient');
      const payload = { clerkId: userId, email, firstName, lastName, role: 'student' };
      const created = await workerClient.post('/users', payload);
      return res.json({ success: true, message: 'Usuario sincronizado en D1', user: created });
    }

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

// 🔹 Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "🚀 API Saviare funcionando correctamente con Clerk" });
});

// Error handler - devuelve JSON en errores no capturados y loguea el stack
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err && err.message ? err.message : 'Internal Server Error' });
});

// 🔹 Sincronizar DB y crear administrador por defecto
async function startServer() {
  try {
    if (process.env.WORKER_URL) {
      console.log('ℹ️ WORKER_URL detected — usando Cloudflare D1 vía Worker. Omitiendo sequelize.sync().')
    } else {
      await sequelize.sync({ alter: true });
      console.log("✅ Base de datos sincronizada");
    }

    const adminEmail = "admin@saviare.com";
    if (process.env.WORKER_URL) {
      console.log('ℹ️ WORKER_URL activo — omitiendo creación/chequeo de usuario administrador local');
    } else {
      const [admin, created] = await User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          clerkId: "admin_default",
          email: adminEmail,
          firstName: "Administrador",
          lastName: "Sistema",
          role: "teacher",
        },
      });

      if (created) console.log("✅ Usuario administrador creado");
      else console.log("ℹ️ Usuario administrador ya existía");
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Servidor en línea en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
  }
}

startServer();
