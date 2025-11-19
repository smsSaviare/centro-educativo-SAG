// backend/src/controllers/courseController.js
const { Course, CourseBlock } = require("../models/CourseModel");
const Enrollment = require("../models/EnrollmentModel");
const User = require("../models/UserModel");
const QuizResult = require("../models/QuizResultModel");

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
      // Los profesores ven TODOS los cursos
      courses = (await Course.findAll()).map((c) => c.toJSON());
    } else {
      const enrollments = await Enrollment.findAll({ where: { clerkId } });
      const courseIds = enrollments.map((e) => e.courseId);
      if (courseIds.length > 0) {
        courses = (
          await Course.findAll({ where: { id: courseIds } })
        ).map((c) => c.toJSON());
      }
    }

    res.json(courses);
  } catch (error) {
    console.error("❌ Error obteniendo cursos:", error);
    res.status(500).json({ error: "Error obteniendo cursos" });
  }
};

/**
 * 👨‍🏫 Obtener todos los estudiantes
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
 * ➕ Asignar estudiantes a curso
 */
exports.assignStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    let { studentClerkId } = req.body;
    const clerkId = req.headers["x-clerk-id"];

    if (!courseId || !studentClerkId)
      return res.status(400).json({ error: "Faltan datos" });

    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId } });
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

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
    
    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId } });
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

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
    
    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId } });
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

    await course.destroy();
    res.json({ success: true, message: "Curso eliminado" });
  } catch (error) {
    console.error("❌ Error borrando curso:", error);
    res.status(500).json({ error: "Error borrando curso" });
  }
};

/**
 * 📘 Obtener bloques de contenido del curso (versión mejorada)
 */
exports.getCourseBlocks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const blocks = await CourseBlock.findAll({
      where: { courseId },
      order: [["position", "ASC"]],
    });

    const formatted = blocks.map((b) => {
      const data = b.content || {};

      if (b.type === "quiz") {
        return {
          id: b.id,
          type: "quiz",
          question: data.question || "",
          options: data.options || [],
          correct: data.correct ?? 0,
        };
      }

      return {
        id: b.id,
        type: b.type,
        content: data.text || "",
        url: data.url || "",
      };
    });

    console.log("🧩 Bloques enviados al frontend:", formatted);
    return res.json({ blocks: formatted });
  } catch (err) {
    console.error("❌ Error al obtener bloques:", err);
    return res.status(500).json({ error: "Error obteniendo contenido del curso" });
  }
};

// 💾 Guardar nota del quiz
exports.saveQuizResult = async (req, res) => {
  try {
    const { clerkId, courseId, quizBlockId, score, answers } = req.body;

    if (!clerkId || !courseId || !quizBlockId)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    // Verificar que exista una asignación previa para este estudiante y quiz
    const existing = await QuizResult.findOne({ where: { clerkId, courseId, quizBlockId } });

    if (!existing) {
      return res.status(403).json({ error: "Quiz no asignado al estudiante" });
    }

    // Verificar intentos restantes
    if (existing.attempts >= existing.maxAttempts) {
      return res.status(403).json({ error: "No quedan intentos para este quiz" });
    }

    // Incrementar intentos y guardar resultado
    existing.attempts = (existing.attempts || 0) + 1;
    existing.score = score;
    existing.answers = answers || null;
    if (existing.attempts >= existing.maxAttempts) {
      existing.completedAt = new Date();
    }
    await existing.save();

    return res.json({ success: true, result: existing });
  } catch (err) {
    console.error("❌ Error guardando resultado del quiz:", err);
    res.status(500).json({ error: "Error guardando resultado del quiz" });
  }
};

// ➕ Asignar un quizBlock a uno o varios estudiantes
exports.assignQuiz = async (req, res) => {
  try {
    const { courseId, quizBlockId } = req.params;
    const { studentClerkId } = req.body;
    const assignedBy = req.headers["x-clerk-id"] || null; // profesor que asigna

    if (!courseId || !quizBlockId || !studentClerkId)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId: assignedBy } });
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

    const students = Array.isArray(studentClerkId) ? studentClerkId : [studentClerkId];
    const created = [];

    for (const clerkId of students) {
      // 1️⃣ Crear o verificar Enrollment para que el estudiante vea el curso
      await Enrollment.findOrCreate({
        where: { courseId: parseInt(courseId), clerkId },
        defaults: { courseId: parseInt(courseId), clerkId },
      });

      // 2️⃣ Crear o verificar QuizResult (asignación)
      const existing = await QuizResult.findOne({ where: { clerkId, courseId, quizBlockId } });
      if (!existing) {
        const row = await QuizResult.create({
          clerkId,
          courseId,
          quizBlockId,
          score: null,
          answers: null,
          assignedBy,
        });
        created.push(row);
      }
    }

    return res.json({ success: true, created });
  } catch (err) {
    console.error("❌ Error asignando quiz:", err);
    return res.status(500).json({ error: "Error asignando quiz" });
  }
};

// 📊 Obtener resultados del curso
exports.getQuizResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { clerkId } = req.query;

    const where = { courseId };
    if (clerkId) where.clerkId = clerkId; // si es estudiante

    const results = await QuizResult.findAll({ where, order: [['quizBlockId','ASC']] });

    // Recuperar datos de usuario (nombre/email) para mostrar en frontend
    const clerkIds = Array.from(new Set(results.map(r => r.clerkId)));
    const users = clerkIds.length > 0 ? await User.findAll({ where: { clerkId: clerkIds } }) : [];
    const userMap = {};
    users.forEach(u => {
      userMap[u.clerkId] = { firstName: u.firstName, lastName: u.lastName, email: u.email };
    });

    const enriched = results.map(r => {
      const row = r.toJSON();
      row.student = userMap[row.clerkId] || null;
      return row;
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ Error obteniendo resultados:", err);
    res.status(500).json({ error: "Error obteniendo resultados" });
  }
};


/**
 * 💾 Guardar bloques de contenido del curso (versión mejorada)
 */
exports.saveCourseBlocks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { clerkId, blocks } = req.body;

    if (!courseId || !clerkId)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    if (!Array.isArray(blocks))
      return res.status(400).json({ error: "Blocks debe ser un array" });

    // Verificar que el curso exista
    const course = await Course.findByPk(courseId);
    if (!course)
      return res.status(404).json({ error: "Curso no encontrado" });

    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId } });
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

    // 🔹 Eliminar bloques anteriores
    await CourseBlock.destroy({ where: { courseId } });

    // 🔹 Guardar nuevos bloques SECUENCIALMENTE para preservar orden
    const savedBlocks = [];
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      let contentData = {};

      if (block.type === "quiz") {
        contentData = {
          question: block.question || "",
          options: block.options || [],
          correct: block.correct ?? 0,
        };
      } else {
        contentData = {
          text: block.content || "",
          url: block.url || "",
        };
      }

      const saved = await CourseBlock.create({
        courseId,
        type: block.type,
        content: contentData,
        position: index, // Asignar posición secuencial
      });
      savedBlocks.push(saved);
    }

    console.log("✅ Bloques guardados correctamente en orden:", savedBlocks.map(b => ({ id: b.id, position: b.position, type: b.type })));
    return res.json({
      success: true,
      message: "Bloques guardados correctamente",
      blocks: savedBlocks,
    });
  } catch (err) {
    console.error("❌ Error guardando bloques:", err);
    return res.status(500).json({ error: "Error guardando contenido del curso" });
  }
};
