// backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

/**
 * 🔍 Obtener todos los usuarios (solo para profesores)
 */
router.get("/", async (req, res) => {
  try {
    const { role } = req.query; // /api/users?role=student
    let users;

    if (role) {
      users = await User.findAll({ where: { role } });
    } else {
      users = await User.findAll();
    }

    res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🔍 Obtener un usuario por su clerkId
 */
router.get("/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findOne({ where: { clerkId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ✏️ Actualizar rol de usuario (solo profesor o admin)
 */
router.put("/:clerkId/role", async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { role } = req.body;

    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({ success: false, message: "Rol inválido" });
    }

    const [updated] = await User.update({ role }, { where: { clerkId } });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = await User.findOne({ where: { clerkId } });

    res.json({
      success: true,
      message: `Rol actualizado a '${role}'`,
      user,
    });
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
