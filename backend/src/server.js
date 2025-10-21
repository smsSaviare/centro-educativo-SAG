// --------------------------------------------------------
// 🌍 PUNTO DE ENTRADA DEL SERVIDOR EXPRESS
// --------------------------------------------------------

require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

// Inicia el servidor y prueba conexión a BD
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Conexión a base de datos establecida.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
}

startServer();
