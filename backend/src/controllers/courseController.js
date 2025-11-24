// backend/src/controllers/courseController.js
const { Course, CourseBlock } = require("../models/CourseModel");
const Enrollment = require("../models/EnrollmentModel");
const User = require("../models/UserModel");
const QuizResult = require("../models/QuizResultModel");
const workerClient = require("../utils/workerClient");

/**
 * 🆕 Crear curso
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, image, resources } = req.body;
    const creatorClerkId = req.headers["x-clerk-id"];

    if (!title || !creatorClerkId)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    // If WORKER_URL is set, delegate creation to the Worker (Cloudflare D1)
    if (process.env.WORKER_URL) {
      const payload = { title, description, image: image || null, resources: resources || null, creatorClerkId };
      const created = await workerClient.post('/courses', payload);
      return res.status(201).json(created);
    }

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
 * Helper: unwrap Worker/D1 response shapes that sometimes return { value: [...] } or { results: [...] }
 */
function unwrapWorkerResponse(data) {
  if (data && typeof data === 'object') {
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data.results)) return data.results;
  }
  return data;
}

/**
 * 📋 Obtener cursos del usuario (profesor o estudiante)
 */
exports.getMyCourses = async (req, res) => {
  try {
    const clerkId = req.headers["x-clerk-id"];
    if (!clerkId) return res.status(400).json({ error: "Falta clerkId" });

    // Worker mode: fetch data from Cloudflare Worker (D1)
    if (process.env.WORKER_URL) {
      const workerClient = require('../utils/workerClient');
      // Get the user from D1
      let users = await workerClient.get(`/users?clerkId=${encodeURIComponent(clerkId)}`);
      users = unwrapWorkerResponse(users);
      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      let courses = [];
      if (user.role === 'teacher') {
        let c = await workerClient.get('/courses');
        courses = unwrapWorkerResponse(c) || [];
      } else {
        let enrolls = await workerClient.get(`/enrollments?clerkId=${encodeURIComponent(clerkId)}`);
        enrolls = unwrapWorkerResponse(enrolls) || [];
        const courseIds = enrolls.map(e => e.courseId);
        let allCourses = await workerClient.get('/courses');
        allCourses = unwrapWorkerResponse(allCourses) || [];
        courses = allCourses.filter(c => courseIds.includes(c.id));
      }

      // Ensure we always return a plain array (some responses may still be wrapped)
      courses = unwrapWorkerResponse(courses) || courses || [];
      return res.json(courses);
    }

    // Local DB mode: use Sequelize models
    const dbUser = await User.findOne({ where: { clerkId } });
    if (!dbUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    let courses = [];
    if (dbUser.role === 'teacher') {
      courses = await Course.findAll();
    } else {
      const enrolls = await Enrollment.findAll({ where: { clerkId } });
      const courseIds = enrolls.map(e => e.courseId);
      const allCourses = await Course.findAll();
      courses = allCourses.filter(c => courseIds.includes(c.id));
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
    const users = await workerClient.get('/users');
    const students = users.filter((u) => u.role === 'student').map(u => ({ clerkId: u.clerkId, email: u.email, firstName: u.firstName, lastName: u.lastName }));
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
    // Verificar rol del usuario a través de Worker
    const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(clerkId)}`);
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

    if (!Array.isArray(studentClerkId)) studentClerkId = [studentClerkId];

    const enrollments = [];
    for (const sid of studentClerkId) {
      try {
        // Pedir al Worker que cree la enrollment en D1
        const resp = await workerClient.post('/enrollments', { courseId: parseInt(courseId), clerkId: sid });
        enrollments.push(resp || { courseId: parseInt(courseId), clerkId: sid });
      } catch (err) {
        console.warn('Error creando enrollment en Worker para', sid, err.message);
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
    // If in WORKER mode, delegate update to the Worker (D1)
    if (process.env.WORKER_URL) {
      const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(clerkId)}`);
      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'No autorizado' });

      try {
        const payload = { title, description, image: image || null, resources: resources || [] };
        const updated = await workerClient.put(`/courses/${encodeURIComponent(courseId)}`, payload);
        return res.json(updated);
      } catch (err) {
        console.error('❌ Error actualizando curso (Worker):', err && err.message ? err.message : err);
        return res.status(500).json({ error: 'Error actualizando curso', detail: (err && err.message) || String(err) });
      }
    }

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
    // If running in worker mode, delegate deletion to the Worker (D1)
    if (process.env.WORKER_URL) {
      // Verify teacher role via Worker
      const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(clerkId)}`);
      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'No autorizado' });

      // Call Worker to delete course and its related data
      await workerClient.delete(`/courses/${encodeURIComponent(courseId)}`);
      return res.json({ success: true, message: 'Curso eliminado' });
    }

    // Fallback: local DB mode
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    // Verificar que el usuario sea profesor
    const user = await User.findOne({ where: { clerkId } });
    if (!user || user.role !== 'teacher')
      return res.status(403).json({ error: 'No autorizado' });

    await course.destroy();
    res.json({ success: true, message: 'Curso eliminado' });
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

    const blocks = await workerClient.get(`/courseblocks?courseId=${encodeURIComponent(courseId)}`);

    // Sanitize and normalize content values that arrived malformed during migration.
    function normalizeContent(contentRaw) {
      if (!contentRaw && contentRaw !== "") return {};
      // If already an object, return as-is
      if (typeof contentRaw === "object") return contentRaw;

      // If string, try JSON.parse first
      if (typeof contentRaw === "string") {
        // Trim and remove surrounding backticks
        let s = contentRaw.trim();
        if (s.startsWith('`') && s.endsWith('`')) s = s.slice(1, -1);

        try {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {
          // continue to heuristics
        }

        // Heuristic: look for a `text` field inside the malformed string
        // Examples observed: "{'text'":'"Uso de EPPs'"  or similar mixes of quotes
        const m = s.match(/text\s*['\"]*\s*[:=]\s*['\"`]+([^'"`\n\r]+)/i);
        if (m && m[1]) {
          return { text: m[1].trim() };
        }

        // Another heuristic: find the longest quoted substring (single or double quotes)
        const quoted = [];
        const qr = s.match(/['"]([^'"]{3,})['"]/g);
        if (qr && qr.length > 0) {
          for (const q of qr) {
            const inner = q.slice(1, -1).trim();
            if (inner.length > 2) quoted.push(inner);
          }
          if (quoted.length > 0) {
            // prefer the longest quoted segment
            quoted.sort((a, b) => b.length - a.length);
            return { text: quoted[0] };
          }
        }

        // Fallback: remove stray braces and quotes and return what's left
        const cleaned = s.replace(/[{}\[\]`]/g, '').replace(/\s+/g, ' ').replace(/\"/g, '"').trim();
        return { text: cleaned };
      }

      // default
      return {};
    }

    const formatted = (blocks || []).map((b) => {
      const contentRaw = b.content;
      const data = normalizeContent(contentRaw) || {};

      if (b.type === "quiz") {
        // Support both legacy single-question quiz blocks and new multi-question format
        if (Array.isArray(data.questions)) {
          return {
            id: b.id,
            type: "quiz",
            questions: data.questions.map((q, qi) => ({
              id: q.id ?? `${b.id}-${qi}`,
              question: q.question || q.text || 'Pregunta sin texto',
              options: Array.isArray(q.options) ? q.options : [],
              correct: typeof q.correct === 'number' ? q.correct : 0,
            })),
          };
        }

        // legacy single-question
        return {
          id: b.id,
          type: "quiz",
          questions: [
            {
              id: `${b.id}-0`,
              question: data.question || data.text || 'Pregunta sin texto',
              options: Array.isArray(data.options) ? data.options : [],
              correct: data.correct ?? 0,
            },
          ],
        };
      }

      return {
        id: b.id,
        type: b.type,
        content: data.text || '',
        url: data.url || '',
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
    // Usar Worker para recuperar asignaciones del usuario
    const qrForUser = await workerClient.get(`/quiz-results?clerkId=${encodeURIComponent(clerkId)}`);
    const existing = qrForUser.find(q => String(q.courseId) === String(courseId) && String(q.quizBlockId) === String(quizBlockId));
    if (!existing) {
      return res.status(403).json({ error: "Quiz no asignado al estudiante" });
    }
    const attempts = existing.attempts ?? 0;
    const maxAttempts = existing.maxAttempts ?? 1;
    if (attempts >= maxAttempts) return res.status(403).json({ error: 'No quedan intentos para este quiz' });

    // Crear un nuevo registro de resultado vía Worker (append)
    const payload = {
      courseId: parseInt(courseId),
      clerkId,
      quizBlockId: parseInt(quizBlockId),
      score: score ?? null,
      answers: answers ?? null,
      assignedBy: existing.assignedBy ?? null,
      completedAt: new Date().toISOString(),
      attempts: attempts + 1,
      maxAttempts: maxAttempts,
    };
    const created = await workerClient.post('/quiz-results', payload);
    return res.json({ success: true, result: created });
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

    // Verificar que el usuario sea profesor mediante Worker
    const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(assignedBy)}`);
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    if (!user || user.role !== "teacher")
      return res.status(403).json({ error: "No autorizado" });

    const students = Array.isArray(studentClerkId) ? studentClerkId : [studentClerkId];
    const created = [];

    for (const clerkId of students) {
      // 1️⃣ Crear Enrollment vía Worker
      try {
        await workerClient.post('/enrollments', { courseId: parseInt(courseId), clerkId });
      } catch (err) {
        console.warn('No se pudo crear enrollment en Worker:', err.message);
      }

      // 2️⃣ Crear QuizResult (asignación) vía Worker
      try {
        const cr = await workerClient.post('/quiz-results', {
          courseId: parseInt(courseId),
          clerkId,
          quizBlockId: parseInt(quizBlockId),
          score: null,
          answers: null,
          assignedBy,
          completedAt: null,
          attempts: 0,
          maxAttempts: 1,
        });
        created.push(cr);
      } catch (err) {
        console.warn('No se pudo crear quizResult en Worker:', err.message);
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
    if (process.env.WORKER_URL) {
      // Fetch quiz results from Worker
      const workerClient = require('./../utils/workerClient');
      const query = clerkId ? `?clerkId=${encodeURIComponent(clerkId)}&courseId=${encodeURIComponent(courseId)}` : `?courseId=${encodeURIComponent(courseId)}`;
      const results = await workerClient.get(`/quiz-results${query}`);

      // Enrich results with user info via Worker
      const enriched = [];
      for (const r of results) {
        const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(r.clerkId)}`);
        const u = Array.isArray(users) && users.length > 0 ? users[0] : null;
        if (!u) continue; // skip results for deleted users
        const row = Object.assign({}, r, { student: { firstName: u.firstName, lastName: u.lastName, email: u.email } });
        enriched.push(row);
      }

      return res.json(enriched.sort((a,b) => (a.quizBlockId||0) - (b.quizBlockId||0)));
    }

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

    // Filtrar resultados para excluir aquellos pertenecientes a users eliminados
    const enriched = results
      .map((r) => {
        const row = r.toJSON();
        row.student = userMap[row.clerkId] || null;
        return row;
      })
      .filter((row) => row.student !== null); // sólo devolver resultados con usuario existente

    res.json(enriched);
  } catch (err) {
    console.error("❌ Error obteniendo resultados:", err);
    res.status(500).json({ error: "Error obteniendo resultados" });
  }
};

/**
 * 📥 Obtener enrollments (inscripciones) de un curso
 */
exports.getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ error: "Falta courseId" });

    // Si estamos en modo Worker/D1 delegamos al Worker
    if (process.env.WORKER_URL) {
      // Obtener enrollments desde el Worker
      const raw = await workerClient.get(`/enrollments?courseId=${encodeURIComponent(courseId)}`);
      const enrolls = unwrapWorkerResponse(raw) || [];

      // Obtener lista de usuarios desde Worker y mapear por clerkId
      const allUsersRaw = await workerClient.get('/users');
      const allUsers = unwrapWorkerResponse(allUsersRaw) || [];
      const userMap = {};
      allUsers.forEach((u) => {
        userMap[u.clerkId] = { firstName: u.firstName, lastName: u.lastName, email: u.email };
      });

      // Enriquecer enrollments con datos de usuario y filtrar usuarios eliminados
      const enriched = enrolls
        .map((e) => {
          const row = Object.assign({}, e);
          row.student = userMap[row.clerkId] || null;
          return row;
        })
        .filter((r) => r.student !== null);

      return res.json(enriched);
    }

    // traer inscripciones desde DB local (fallback)
    const enrolls = await Enrollment.findAll({ where: { courseId } });

    // obtener datos de usuario para los clerkIds encontrados
    const clerkIds = Array.from(new Set(enrolls.map((e) => e.clerkId)));
    const users = clerkIds.length > 0 ? await User.findAll({ where: { clerkId: clerkIds } }) : [];
    const userMap = {};
    users.forEach((u) => {
      userMap[u.clerkId] = { firstName: u.firstName, lastName: u.lastName, email: u.email };
    });

    // enriquecer y filtrar enrollments para excluir usuarios eliminados
    const enriched = enrolls
      .map((e) => {
        const row = e.toJSON();
        row.student = userMap[row.clerkId] || null;
        return row;
      })
      .filter((r) => r.student !== null);

    res.json(enriched);
  } catch (err) {
    console.error("❌ Error obteniendo enrollments:", err);
    res.status(500).json({ error: "Error obteniendo inscripciones" });
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

    // Si estamos en modo Worker, delegar al Worker (D1)
    if (process.env.WORKER_URL) {
      // Verificar que el usuario sea profesor mediante Worker
      const users = await workerClient.get(`/users?clerkId=${encodeURIComponent(clerkId)}`);
      const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
      if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'No autorizado' });

      // Enviar todos los bloques al Worker para reemplazar los existentes
      const payload = { courseId: parseInt(courseId), blocks };
      try {
        const resp = await workerClient.post('/courseblocks', payload);
        return res.json({ success: true, message: 'Bloques guardados correctamente', blocks: resp });
      } catch (err) {
        console.error('❌ Error guardando bloques (Worker):', err && err.message ? err.message : err);
        return res.status(500).json({ error: 'Error guardando contenido del curso', detail: (err && err.message) || String(err) });
      }
    }

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
        // Support new multi-question format if present
        if (Array.isArray(block.questions)) {
          contentData = { questions: block.questions };
        } else {
          contentData = {
            question: block.question || "",
            options: block.options || [],
            correct: block.correct ?? 0,
          };
        }
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
