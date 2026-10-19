const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ===== SECTIONS =====
router.post('/sections', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { course_id, title, description, order_num } = req.body;
    if (!course_id || !title) {
      return res.status(400).json({ error: 'course_id и title обязательны' });
    }
    const section = db.createSection({ course_id, title, description, order_num });
    res.status(201).json({ section });
  } catch (err) {
    console.error('Create section error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/sections/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { title, description, order_num } = req.body;
    const section = db.updateSection(req.params.id, {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(order_num !== undefined ? { order_num } : {})
    });
    res.json({ section });
  } catch (err) {
    console.error('Update section error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/sections/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    db.deleteSection(req.params.id);
    res.json({ message: 'Секция удалена' });
  } catch (err) {
    console.error('Delete section error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== LESSONS =====
router.post('/lessons', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { section_id, title, description, video_url, content, duration, order_num } = req.body;
    if (!section_id || !title) {
      return res.status(400).json({ error: 'section_id и title обязательны' });
    }
    const lesson = db.createLesson({ section_id, title, description, video_url, content, duration, order_num });
    res.status(201).json({ lesson });
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/lessons/:id', authenticate, (req, res) => {
  try {
    const data = db.getLessonById(req.params.id, req.user.id);
    if (!data) {
      return res.status(404).json({ error: 'Урок не найден' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      const isEnrolled = data.course ? db.isEnrolled(req.user.id, data.course.id) : false;
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Вы не записаны на этот курс' });
      }
    }

    res.json(data);
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/lessons/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { title, description, video_url, content, duration, order_num } = req.body;
    const lesson = db.updateLesson(req.params.id, {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(video_url !== undefined ? { video_url } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(duration !== undefined ? { duration } : {}),
      ...(order_num !== undefined ? { order_num } : {})
    });
    res.json({ lesson });
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/lessons/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    db.deleteLesson(req.params.id);
    res.json({ message: 'Урок удалён' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/lessons/:id/complete', authenticate, (req, res) => {
  try {
    db.markLessonComplete(req.user.id, req.params.id);
    res.json({ message: 'Урок отмечен как пройденный' });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/lessons/:id/watch-progress - Track real-time video watch percentage
router.post('/lessons/:id/watch-progress', authenticate, (req, res) => {
  try {
    const { percent, currentTime, duration } = req.body;
    const progress = db.updateLessonProgress(req.user.id, req.params.id, {
      percent,
      currentTime,
      duration
    });
    res.json({ success: true, progress });
  } catch (err) {
    console.error('Watch progress error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/achievements/my - Student achievements and progress analytics
router.get('/achievements/my', authenticate, (req, res) => {
  try {
    const details = db.getUserProgressDetails(req.user.id);
    if (!details) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(details);
  } catch (err) {
    console.error('Achievements error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== ASSIGNMENTS =====
router.post('/assignments', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const { lesson_id, title, description, type } = req.body;
    if (!lesson_id || !title) {
      return res.status(400).json({ error: 'lesson_id и title обязательны' });
    }
    const assignment = db.createAssignment({ lesson_id, title, description, type });
    res.status(201).json({ assignment });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/assignments/:id/submit', authenticate, (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Ответ не может быть пустым' });
    }
    const submission = db.submitAssignment({
      assignment_id: req.params.id,
      user_id: req.user.id,
      content
    });
    res.json({ message: 'Ответ отправлен', submission });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== MATERIALS =====
router.post('/materials/upload', authenticate, requireRole('admin', 'instructor'), upload.single('file'), (req, res) => {
  try {
    const { lesson_id, title } = req.body;
    if (!lesson_id || !req.file) {
      return res.status(400).json({ error: 'lesson_id и файл обязательны' });
    }
    const material = db.createMaterial({
      lesson_id,
      title: title || req.file.originalname,
      filename: req.file.originalname,
      filepath: req.file.filename,
      filetype: req.file.mimetype
    });
    res.status(201).json({ material });
  } catch (err) {
    console.error('Upload material error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/materials/:id', authenticate, requireRole('admin', 'instructor'), (req, res) => {
  try {
    const material = db.deleteMaterial(req.params.id);
    if (material && material.filepath) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', material.filepath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Материал удалён' });
  } catch (err) {
    console.error('Delete material error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
