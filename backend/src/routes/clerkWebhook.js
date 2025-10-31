// backend/src/routes/clerkWebhook.js
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

/**
 * ✅ Webhook de Clerk (modo gratuito)
 * Escucha eventos básicos sin verificación de firma
 * Compatible con Render y Clerk test keys
 */
router.post("/clerk-webhook", express.json(), async (req, res) => {
  try {
    const event = req.body.type;
    const data = req.body.data || {};

    if (!data.id) {
      console.warn("⚠️ Webhook recibido sin ID de usuario válido");
      return res.status(400).json({ success: false, error: "Datos de usuario inválidos" });
    }

    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "sin_email@correo.com";
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";

    switch (event) {
      case "user.created":
        await User.findOrCreate({
          where: { clerkId },
          defaults: { clerkId, email, firstName, lastName, role: "student" },
        });
        console.log(`✅ Usuario creado en DB: ${email}`);
        break;

      case "user.updated":
        await User.update(
          { email, firstName, lastName },
          { where: { clerkId } }
        );
        console.log(`🌀 Usuario actualizado en DB: ${email}`);
        break;

      case "user.deleted":
        await User.destroy({ where: { clerkId } });
        console.log(`🗑️ Usuario eliminado de DB: ${email}`);
        break;

      default:
        console.log(`ℹ️ Evento Clerk ignorado: ${event}`);
        break;
    }

    res.json({ success: true, message: `Evento ${event} procesado correctamente` });
  } catch (error) {
    console.error("❌ Error en Clerk Webhook:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
