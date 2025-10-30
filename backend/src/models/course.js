// backend/src/models/Course.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Course = sequelize.define("Course", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  resources: { type: DataTypes.JSON, allowNull: true }, // e.g. [{type:'youtube', url:'...'}, {type:'pdf', url:'...'}]
  creatorClerkId: { type: DataTypes.STRING, allowNull: false }, // clerkId del profesor
}, {
  tableName: "Courses"
});

module.exports = Course;
