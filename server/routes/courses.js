const express = require('express');
const db = require('../db');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - List published courses with filters
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, level, search } = req.query;
    const courses = db.getCourses({
      is_published: 1,
      category,
      level,
      search
    });
    res.json({ courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/courses/categories - Get unique categories
router.get('/categories', (req, res) => {
  try {
    const data = db.get();
    const categories = Array.from(new Set(
      data.courses.filter(c => c.is_published && c.category).map(c => c.category)
    ));
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/courses/my - Get enrolled courses for current user
router.get('/my', authenticate, (req, res) => {
  try {
    const courses = db.getUserEnrollments(req.user.id);
    res.json({ courses });
  } catch (err) {
    console.error('Get my courses error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/courses/:id - Get course details
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const details = db.getCourseById(req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    const enrolled = req.user ? db.isEnrolled(req.user.id, req.params.id) : false;

    res.json({
      course: details.course,
      sections: details.sections,
      enrolled
    });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/courses - Create course
router.post('/', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { title, description, thumbnail, category, level, duration } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Название курса обязательно' });
    }

    const course = db.createCourse({
      title,
      description,
      thumbnail,
      category,
      level,
      duration,
      instructor_id: req.user.id,
      is_published: 0
    });

    res.status(201).json({ course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { title, description, thumbnail, category, level, duration, is_published } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (category !== undefined) updates.category = category;
    if (level !== undefined) updates.level = level;
    if (duration !== undefined) updates.duration = duration;
    if (is_published !== undefined) updates.is_published = is_published ? 1 : 0;

    const course = db.updateCourse(req.params.id, updates);
    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json({ course });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  try {
    db.deleteCourse(req.params.id);
    res.json({ message: 'Курс удалён' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/courses/:id/enroll - Access granted ONLY by Admin
router.post('/:id/enroll', authenticate, (req, res) => {
  return res.status(403).json({
    error: 'Курсқа рұқсат тек әкімшілік арқылы беріледі. Доступ к курсу выдается только через администратора.'
  });
});

// GET /api/courses/:id/progress - Get progress
router.get('/:id/progress', authenticate, (req, res) => {
  try {
    const progress = db.getCourseProgress(req.user.id, req.params.id);
    res.json({ progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
