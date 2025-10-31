// backend/src/models/CourseModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

const Course = sequelize.define("Course", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
  resources: { type: DataTypes.JSON }, // e.g. [{type:'link', url:'...'}]
  creatorClerkId: { type: DataTypes.STRING, allowNull: false }, // profesor que lo creó
}, {
  tableName: "Courses",
});

// Asociación (un profesor crea muchos cursos)
User.hasMany(Course, {
  foreignKey: "creatorClerkId",
  sourceKey: "clerkId",
});
Course.belongsTo(User, {
  foreignKey: "creatorClerkId",
  targetKey: "clerkId",
});

module.exports = Course;
