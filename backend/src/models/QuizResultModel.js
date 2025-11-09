// backend/src/models/QuizResultModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QuizResult = sequelize.define("QuizResult", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  clerkId: { type: DataTypes.STRING, allowNull: false }, // estudiante
  quizBlockId: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
  answers: { type: DataTypes.JSON },
});

module.exports = QuizResult;
