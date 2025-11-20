// backend/src/routes/courses.js
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getMyCourses,
  getStudents,
  assignStudent,
  assignQuiz,
  saveQuizResult,
  getCourseEnrollments,
  getQuizResults,
  updateCourse,
  deleteCourse,
  getCourseBlocks,
  saveCourseBlocks,
} = require("../controllers/courseController");

const { Course } = require("../models/CourseModel");

// Crear curso
router.post("/", createCourse);

// Obtener mis cursos
router.get("/my-courses", getMyCourses);

// Obtener lista de estudiantes
router.get("/students", getStudents);

// Obtener un curso por ID
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  if (process.env.WORKER_URL) {
    try {
      const workerClient = require('../utils/workerClient');
      const c = await workerClient.get(`/courses/${encodeURIComponent(courseId)}`);
      if (!c) return res.status(404).json({ error: 'Curso no encontrado' });
      return res.json(c);
    } catch (err) {
      console.error('❌ Error obteniendo curso via Worker:', err.message || err);
      return res.status(500).json({ error: 'Error obteniendo curso' });
    }
  }

  const course = await Course.findByPk(courseId);
  if (!course) return res.status(404).json({ error: "Curso no encontrado" });
  res.json(course);
});

// Asignar estudiante
router.post("/:courseId/assign", assignStudent);

// Editar curso
router.put("/:courseId", updateCourse);

// Eliminar curso
router.delete("/:courseId", deleteCourse);

// Bloques de contenido (mantén solo estas dos líneas)
router.get("/:courseId/blocks", getCourseBlocks);
router.put("/:courseId/blocks", saveCourseBlocks);


// Asignar un quizBlock a estudiante(s)
router.post('/:courseId/blocks/:quizBlockId/assign', assignQuiz);

// Guardar resultado de quiz (envío por estudiante)
router.post('/:courseId/quiz/submit', saveQuizResult);

// Obtener resultados del curso (opcional clerkId query para filtrar por estudiante)
router.get('/:courseId/quiz/results', getQuizResults);
// Obtener enrollments (inscripciones) del curso
router.get('/:courseId/enrollments', getCourseEnrollments);
module.exports = router;
