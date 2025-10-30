// backend/src/routes/clerkWebhook.js
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

router.post("/clerk-webhook", async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name } = req.body.data || {};
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

    res.json({
      success: true,
      message: created ? "Usuario creado" : "Usuario existente actualizado",
      user,
    });
  } catch (error) {
    console.error("❌ Error en Clerk Webhook:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ exportación correcta
module.exports = router;
