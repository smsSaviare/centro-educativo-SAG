// backend/src/models/index.js
const Course = require("./CourseModel");
const Enrollment = require("./EnrollmentModel");
const User = require("./UserModel");

// Relaciones
Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

User.hasMany(Enrollment, { foreignKey: "clerkId", sourceKey: "clerk_id" });
Enrollment.belongsTo(User, { foreignKey: "clerkId", targetKey: "clerk_id" });

module.exports = { Course, Enrollment, User };
