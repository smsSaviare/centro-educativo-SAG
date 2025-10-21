// --------------------------------------------------------
// 🛠️ SCRIPT PARA CREAR LAS TABLAS DE LA BASE DE DATOS
// --------------------------------------------------------
// Este script se usa una sola vez al principio para generar las tablas
// definidas en los modelos (como User.js).

const sequelize = require('../config/database');
const User = require('../models/User');

async function syncDatabase() {
  try {
    // 🔹 Crea las tablas basadas en los modelos definidos
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente en la base de datos.');

    process.exit(0); // Finaliza el proceso correctamente
  } catch (error) {
    console.error('❌ Error al sincronizar las tablas:', error);
    process.exit(1); // Finaliza con error
  }
}

syncDatabase();
