// --------------------------------------------------------
// 🔐 RUTAS DE AUTENTICACIÓN (Registro e Inicio de Sesión)
// --------------------------------------------------------

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// 📌 Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validaciones básicas
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: 'El correo ya está registrado' });

    // Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await User.create({ name, email, passwordHash, role });
    res.status(201).json({ message: 'Usuario registrado exitosamente', newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// 📌 Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

module.exports = router;
