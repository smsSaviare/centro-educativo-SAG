// backend/src/models/index.js
const Course = require("./CourseModel");
const Enrollment = require("./EnrollmentModel");
const User = require("./UserModel");

// Relaciones
Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

// 🔹 Aseguramos coherencia: usamos 'clerk_id' en ambas
User.hasMany(Enrollment, { foreignKey: "clerk_id", sourceKey: "clerk_id" });
Enrollment.belongsTo(User, { foreignKey: "clerk_id", targetKey: "clerk_id" });

module.exports = { Course, Enrollment, User };