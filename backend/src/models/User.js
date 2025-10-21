// --------------------------------------------------------
// 👤 MODELO DE USUARIO
// --------------------------------------------------------
// Este modelo define cómo se verá la tabla "Users" en la base de datos.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  // 🔹 Nombre completo del usuario
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // 🔹 Correo electrónico (debe ser único)
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },

  // 🔹 Contraseña encriptada (hash)
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // 🔹 Rol: puede ser 'student', 'teacher' o 'admin'
  role: {
    type: DataTypes.STRING,
    defaultValue: 'student',
  },
});

// Exportamos el modelo para usarlo en otros archivos
module.exports = User;
