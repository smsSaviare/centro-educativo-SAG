// backend/src/config/database.js
const { Sequelize } = require("sequelize");

// Si WORKER_URL está definido usamos Cloudflare D1 vía Worker.
// En ese caso exportamos un 'mock' de sequelize para evitar intentos de conexión a Postgres
if (process.env.WORKER_URL) {
  console.log('ℹ️ DATABASE: WORKER_URL activo — exportando sequelize dummy para evitar conexiones a Postgres');

  const DummyModel = class {
    static async findByPk() { throw new Error('DB disabled when WORKER_URL is set') }
    static async findOne() { throw new Error('DB disabled when WORKER_URL is set') }
    static async findAll() { throw new Error('DB disabled when WORKER_URL is set') }
    static async create() { throw new Error('DB disabled when WORKER_URL is set') }
    static async destroy() { throw new Error('DB disabled when WORKER_URL is set') }
    static hasMany() { /* noop */ }
    static belongsTo() { /* noop */ }
    async update() { throw new Error('DB disabled when WORKER_URL is set') }
    toJSON() { return this }
  }

  const dummy = {
    define: () => DummyModel,
    authenticate: async () => true,
    sync: async () => true,
  }

  module.exports = dummy;
} else {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // importante para Render
      },
    },
  });

  module.exports = sequelize;
}
