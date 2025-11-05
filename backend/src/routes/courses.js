// backend/src/routes/courses.js
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getMyCourses,
  getStudents,
  assignStudent,
  updateCourse,
  deleteCourse,
  getCourseBlocks,
  saveCourseBlocks,
} = require("../controllers/courseController");

// Crear curso
router.post("/", createCourse);

// Obtener mis cursos
router.get("/my-courses", getMyCourses);

// Obtener lista de estudiantes
router.get("/students", getStudents);

// Asignar estudiante
router.post("/:courseId/assign", assignStudent);

// Editar curso
router.put("/:courseId", updateCourse);

// Eliminar curso
router.delete("/:courseId", deleteCourse);

// Bloques de contenido
router.get("/:courseId/blocks", getCourseBlocks);
router.post("/:courseId/blocks", saveCourseBlocks);

module.exports = router;
