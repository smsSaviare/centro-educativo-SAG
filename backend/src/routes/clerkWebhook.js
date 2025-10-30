import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/webhooks/clerk", express.json(), async (req, res) => {
  const event = req.body;

  try {
    if (event.type === "user.created") {
      const clerkUser = event.data;

      await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.email_addresses[0].email_address,
        name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim(),
        role: clerkUser.public_metadata.role || "student"
      });
      console.log("✅ Usuario creado en base de datos:", clerkUser.id);
    }

    if (event.type === "user.deleted") {
      await User.destroy({ where: { clerkId: event.data.id } });
      console.log("🗑️ Usuario eliminado:", event.data.id);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Error en webhook Clerk:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
