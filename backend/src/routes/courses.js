// backend/src/routes/courses.js
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getMyCourses,
  getStudents,
  assignStudent,
} = require("../controllers/courseController");

// Crear curso
router.post("/", createCourse);

// Obtener mis cursos (profesor o estudiante)
router.get("/my-courses", getMyCourses);

// Obtener lista de estudiantes
router.get("/students", getStudents);

// Asignar estudiante a curso
router.post("/:courseId/assign", assignStudent);

module.exports = router;
