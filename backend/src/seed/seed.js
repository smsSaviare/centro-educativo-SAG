// backend/src/seed/seed.js
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/UserModel');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Conexión establecida correctamente.');

    // 🔹 Creamos una contraseña cifrada
    const passwordHash = await bcrypt.hash('admin123', 10);

    // 🔹 Insertamos un usuario inicial
    await User.create({
      name: 'Administrador',
      email: 'admin@saviare.com',
      passwordHash,
      role: 'admin',
    });

    console.log('✅ Usuario administrador creado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el seed:', error);
    process.exit(1);
  }
}

seed();
