// backend/src/routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

// Middleware simple que comprueba que clerkId enviado existe en DB
async function requireUser(req, res, next) {
  const clerkId = req.headers["x-clerk-id"] || req.body.clerkId;
  if (!clerkId) return res.status(401).json({ error: "No clerkId provided" });
  const user = await User.findOne({ where: { clerkId } });
  if (!user) return res.status(401).json({ error: "User not found" });
  req.currentUser = user;
  next();
}

// Crear curso (solo teacher)
router.post("/", requireUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
    const { title, description, image, resources } = req.body;
    const course = await Course.create({
      title,
      description,
      image,
      resources,
      creatorClerkId: req.currentUser.clerkId,
    });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } 
});

// Asignar estudiante a curso
router.post("/:id/assign", requireUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
    const courseId = req.params.id;
    const { studentClerkId } = req.body;
    // valida existencia
    const student = await User.findOne({ where: { clerkId: studentClerkId } });
    if (!student) return res.status(404).json({ error: "Student not found" });
    // crea inscripción
    const enroll = await Enrollment.create({ courseId, clerkId: studentClerkId });
    res.json({ message: "Assigned", enroll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Obtener cursos visibles para el usuario actual
router.get("/my-courses", requireUser, async (req, res) => {
  try {
    const user = req.currentUser;
    if (user.role === "teacher") {
      // todos los cursos creados por el teacher
      const courses = await Course.findAll({ where: { creatorClerkId: user.clerkId } });
      return res.json(courses);
    } else {
      // courses donde está inscrito
      const enrolls = await Enrollment.findAll({ where: { clerkId: user.clerkId } });
      const courseIds = enrolls.map(e => e.courseId);
      const courses = await Course.findAll({ where: { id: courseIds } });
      return res.json(courses);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
