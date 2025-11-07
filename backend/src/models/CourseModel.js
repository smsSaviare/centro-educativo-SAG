// backend/src/models/CourseModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

const Course = sequelize.define(
  "Course",
  {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    resources: { type: DataTypes.JSON },
    creatorClerkId: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "Courses" }
);

const CourseBlock = sequelize.define(
  "CourseBlock",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }, // text, image, video, quiz
    content: { type: DataTypes.JSON, allowNull: true },
  },
  { tableName: "CourseBlocks" }
);

// Relaciones
Course.hasMany(CourseBlock, { foreignKey: "courseId", onDelete: "CASCADE" });
CourseBlock.belongsTo(Course, { foreignKey: "courseId" });

User.hasMany(Course, {
  foreignKey: "creatorClerkId",
  sourceKey: "clerkId",
});
Course.belongsTo(User, {
  foreignKey: "creatorClerkId",
  targetKey: "clerkId",
});

module.exports = { Course, CourseBlock };