const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  document: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  birthDate: { type: DataTypes.DATEONLY, allowNull: true },
  role: { type: DataTypes.STRING, defaultValue: 'student' },
});

module.exports = User;
