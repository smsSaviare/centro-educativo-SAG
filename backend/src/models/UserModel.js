// backend/src/models/UserModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    clerkId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("admin", "teacher", "student"), // ✅ ahora acepta admin
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    tableName: "Users",
  }
);

module.exports = User;
