// backend/src/models/EnrollmentModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Course = require("./CourseModel");
const User = require("./UserModel");

const Enrollment = sequelize.define("Enrollment", {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  clerkId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "Enrollments",
});

// Relaciones
Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

User.hasMany(Enrollment, { foreignKey: "clerkId", sourceKey: "clerkId" });
Enrollment.belongsTo(User, { foreignKey: "clerkId", targetKey: "clerkId" });

module.exports = Enrollment;
