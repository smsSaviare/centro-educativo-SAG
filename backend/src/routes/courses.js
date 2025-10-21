const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const Course = require('../models/course'); // definir similar a User
const Enrollment = require('../models/enrollment'); // relación
const router = express.Router();

// GET /api/courses - list public or all
router.get('/', async (req,res) => {
  const courses = await Course.findAll();
  res.json(courses);
});

// POST /api/courses - solo teacher crea
router.post('/', authMiddleware, requireRole('teacher'), async (req,res) => {
  const { title, description, image, resources } = req.body;
  const course = await Course.create({ title, description, image, resources, teacherId: req.user.id });
  res.status(201).json(course);
});

// POST /api/courses/:id/enroll - enroll (teacher o student)
router.post('/:id/enroll', authMiddleware, async (req,res) => {
  const courseId = req.params.id;
  const studentId = req.body.studentId || req.user.id;
  const en = await Enrollment.create({ courseId, studentId });
  res.json(en);
});
module.exports = router;
