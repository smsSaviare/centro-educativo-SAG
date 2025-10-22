const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/mailer"); // tu función de envío de correo

const router = express.Router();
const passwordResetTokens = {}; // token temporal en memoria

// -------------------- Registro --------------------
router.post("/register", async (req, res) => {
  try {
    const { name, document, email, password, phone, birthDate, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Campos obligatorios faltantes" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Usuario ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, document, email, passwordHash, phone, birthDate, role });

    res.status(201).json({ id: newUser.id, message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -------------------- Login --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = crypto.randomBytes(16).toString("hex");
    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// -------------------- Forgot Password --------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const token = crypto.randomBytes(20).toString("hex");
    passwordResetTokens[token] = { email, expires: Date.now() + 3600000 }; // 1 hora

    // Link para GH Pages
    const resetLink = `${process.env.FRONTEND_URL}/#/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Restablecer contraseña - Centro Educativo SAG",
      `<p>Hola ${user.name},</p>
       <p>Haz clic en el enlace para restablecer tu contraseña:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>Este enlace expirará en 1 hora.</p>`
    );

    res.json({ message: "Se ha enviado un correo para restablecer la contraseña" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// -------------------- Reset Password --------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const record = passwordResetTokens[token];
    if (!record || record.expires < Date.now())
      return res.status(400).json({ error: "Token inválido o expirado" });

    const user = await User.findOne({ where: { email: record.email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    delete passwordResetTokens[token];

    res.json({ message: "Contraseña restablecida con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
