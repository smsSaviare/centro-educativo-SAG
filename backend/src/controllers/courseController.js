// backend/src/controllers/courseController.js
const Course = require("../models/CourseModel");
const Enrollment = require("../models/EnrollmentModel");
const User = require("../models/UserModel");

/**
 * 🆕 Crear curso
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, image, resources } = req.body;
    const creatorClerkId = req.headers["x-clerk-id"];

    if (!title || !creatorClerkId)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    const course = await Course.create({
      title,
      description,
      image,
      resources,
      creatorClerkId,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("❌ Error creando curso:", error);
    res.status(500).json({ error: "Error creando curso" });
  }
};

/**
 * 📋 Obtener cursos del usuario (profesor o estudiante)
 */
exports.getMyCourses = async (req, res) => {
  try {
    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) return res.status(400).json({ error: "Falta clerkId" });

    // Verificamos si es profesor
    const user = await User.findOne({ where: { clerk_id: clerkId } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    let courses;
    if (user.role === "teacher") {
      courses = await Course.findAll({ where: { creatorClerkId: clerkId } });
    } else {
      const enrollments = await Enrollment.findAll({ where: { clerkId } });
      const courseIds = enrollments.map((e) => e.courseId);
      courses = await Course.findAll({ where: { id: courseIds } });
    }

    res.json(courses);
  } catch (error) {
    console.error("❌ Error obteniendo cursos:", error);
    res.status(500).json({ error: "Error obteniendo cursos" });
  }
};

/**
 * 👨‍🏫 Obtener todos los estudiantes (para asignar)
 */
exports.getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: "student" },
      attributes: ["clerk_id", "email", "first_name", "last_name"],
    });
    res.json(students);
  } catch (error) {
    console.error("❌ Error obteniendo estudiantes:", error);
    res.status(500).json({ error: "Error obteniendo estudiantes" });
  }
};

/**
 * ➕ Asignar estudiante a curso
 */
exports.assignStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentClerkId } = req.body;

    if (!courseId || !studentClerkId)
      return res.status(400).json({ error: "Faltan datos" });

    const existing = await Enrollment.findOne({
      where: { courseId, clerkId: studentClerkId },
    });

    if (existing) {
      return res.status(400).json({ error: "Estudiante ya inscrito" });
    }

    const enrollment = await Enrollment.create({
      courseId,
      clerkId: studentClerkId,
    });

    res.json({ enroll: enrollment });
  } catch (error) {
    console.error("❌ Error asignando estudiante:", error);
    res.status(500).json({ error: "Error asignando estudiante" });
  }
};
