// --------------------------------------------------------
// 🚀 CONFIGURACIÓN PRINCIPAL DE EXPRESS
// --------------------------------------------------------

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 🔹 Middlewares globales
app.use(cors());
app.use(bodyParser.json());

// 🔹 Rutas
app.use('/api/auth', authRoutes);

// 🔹 Ruta base
app.get('/', (req, res) => {
  res.json({ message: '¡Bienvenido a la API del Centro Educativo SAG!' });
});

module.exports = app;
