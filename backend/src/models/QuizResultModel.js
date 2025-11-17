// backend/src/models/QuizResultModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QuizResult = sequelize.define("QuizResult", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  clerkId: { type: DataTypes.STRING, allowNull: false }, // estudiante
  quizBlockId: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: true },
  answers: { type: DataTypes.JSON },
  assignedBy: { type: DataTypes.STRING, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  maxAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
});

module.exports = QuizResult;
