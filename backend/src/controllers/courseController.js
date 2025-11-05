// backend/src/controllers/courseController.js
const { Course, CourseBlock } = require("../models/CourseModel");
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

  res.status(201).json(course.toJSON());
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

  const user = await User.findOne({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  let courses = [];

  if (user.role === "teacher") {
  courses = (await Course.findAll({ where: { creatorClerkId: clerkId } })).map(c => c.toJSON());
  } else {
  const enrollments = await Enrollment.findAll({ where: { clerkId } });
  const courseIds = enrollments.map(e => e.courseId);
  if (courseIds.length > 0) {
  courses = (await Course.findAll({ where: { id: courseIds } })).map(c => c.toJSON());
  }
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
  attributes: ["clerkId", "email", "firstName", "lastName"],
  });
  res.json(students);
  } catch (error) {
  console.error("❌ Error obteniendo estudiantes:", error);
  res.status(500).json({ error: "Error obteniendo estudiantes" });
  }
  };

/**

* ➕ Asignar estudiantes a curso (puede ser un array)
  */
  exports.assignStudent = async (req, res) => {
  try {
  const { courseId } = req.params;
  let { studentClerkId } = req.body;

  if (!courseId || !studentClerkId)
  return res.status(400).json({ error: "Faltan datos" });

  if (!Array.isArray(studentClerkId)) studentClerkId = [studentClerkId];

  const enrollments = [];
  for (const clerkId of studentClerkId) {
  const existing = await Enrollment.findOne({ where: { courseId, clerkId } });
  if (!existing) {
  const enrollment = await Enrollment.create({ courseId, clerkId });
  enrollments.push(enrollment);
  }
  }

  res.json({ enrollments, success: enrollments.length > 0 });
  } catch (error) {
  console.error("❌ Error asignando estudiante(s):", error);
  res.status(500).json({ error: "Error asignando estudiante(s)" });
  }
  };

/**

* ✏️ Actualizar curso
  */
  exports.updateCourse = async (req, res) => {
  try {
  const { courseId } = req.params;
  const { title, description, image, resources } = req.body;
  const clerkId = req.headers["x-clerk-id"];

  const course = await Course.findByPk(courseId);
  if (!course) return res.status(404).json({ error: "Curso no encontrado" });
  if (course.creatorClerkId !== clerkId) return res.status(403).json({ error: "No autorizado" });

  await course.update({ title, description, image, resources });
  res.json(course.toJSON());
  } catch (error) {
  console.error("❌ Error actualizando curso:", error);
  res.status(500).json({ error: "Error actualizando curso" });
  }
  };

/**

* 🗑️ Borrar curso
  */
  exports.deleteCourse = async (req, res) => {
  try {
  const { courseId } = req.params;
  const clerkId = req.headers["x-clerk-id"];

  const course = await Course.findByPk(courseId);
  if (!course) return res.status(404).json({ error: "Curso no encontrado" });
  if (course.creatorClerkId !== clerkId) return res.status(403).json({ error: "No autorizado" });

  await course.destroy();
  res.json({ success: true, message: "Curso eliminado" });
  } catch (error) {
  console.error("❌ Error borrando curso:", error);
  res.status(500).json({ error: "Error borrando curso" });
  }
  };

 /**
 * 📘 Bloques de contenido
 */
// Obtener bloques del curso
exports.getCourseBlocks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const blocks = await CourseBlock.findAll({
      where: { courseId },
      order: [["id", "ASC"]],
    });
    return res.json(blocks);
  } catch (err) {
    console.error("❌ Error al obtener bloques:", err);
    return res.status(500).json({ error: "Error obteniendo contenido del curso" });
  }
};

// Guardar o actualizar bloques del curso
exports.saveCourseBlocks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { blocks } = req.body; // array de {type, content}

    if (!Array.isArray(blocks)) {
      return res.status(400).json({ error: "Formato inválido de bloques" });
    }

    // 🔄 borrar los antiguos bloques y guardar los nuevos
    await CourseBlock.destroy({ where: { courseId } });

    const saved = await Promise.all(
      blocks.map((b) =>
        CourseBlock.create({
          courseId,
          type: b.type,
          content: b.content,
        })
      )
    );

    return res.json({ success: true, blocks: saved });
  } catch (err) {
    console.error("❌ Error al guardar bloques:", err);
    return res.status(500).json({ error: "Error guardando contenido del curso" });
  }
};
