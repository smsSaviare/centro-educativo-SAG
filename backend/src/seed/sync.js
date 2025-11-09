// backend/src/seed/sync.js

const sequelize = require('../config/database');
const User = require('../models/UserModel');

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
