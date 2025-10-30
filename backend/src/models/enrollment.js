// backend/src/models/Enrollment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Enrollment = sequelize.define("Enrollment", {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  clerkId: { type: DataTypes.STRING, allowNull: false }, // clerkId del estudiante
}, {
  tableName: "Enrollments"
});

module.exports = Enrollment;
