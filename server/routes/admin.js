const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const data = db.getStats();
    res.json(data);
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const { search } = req.query;
    const data = db.get();
    let users = data.users.map(u => {
      const userEnrollments = data.enrollments
        .filter(e => e.user_id === u.id)
        .map(e => {
          const c = data.courses.find(crs => crs.id === e.course_id);
          return c ? { id: c.id, title: c.title, category: c.category } : null;
        })
        .filter(Boolean);

      return {
        id: u.id,
        name: u.name,
        phone: u.phone || null,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        created_at: u.created_at,
        enrolled_courses: userEnrollments
      };
    });

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/users - Admin manually creates a new user (student / teacher / admin)
router.post('/users', (req, res) => {
  try {
    const { name, phone, email, password, role = 'student', course_ids = [] } = req.body;

    if (!name || (!phone && !email) || !password) {
      return res.status(400).json({ error: 'Аты-жөнін, телефон немесе email, және құпиясөзді енгізіңіз' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Құпиясөз кемінде 6 символдан тұруы керек' });
    }

    if (phone) {
      const existingPhone = db.findUserByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({ error: 'Бұл телефон нөмірімен қолданушы тіркелген' });
      }
    }

    if (email) {
      const existingEmail = db.findUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Бұл email-мен қолданушы тіркелген' });
      }
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const user = db.createUser({
      name,
      phone,
      email,
      password_hash,
      role
    });

    // If courses selected, enroll immediately
    if (Array.isArray(course_ids) && course_ids.length > 0) {
      for (const cid of course_ids) {
        db.enroll(user.id, cid);
      }
    }

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      message: 'Қолданушы сәтті қосылды'
    });
  } catch (err) {
    console.error('Create user by admin error:', err);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    const user = db.updateUser(req.params.id, { role });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Change role error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }
    db.deleteUser(req.params.id);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/users/:id/password - Admin resets student password
router.put('/users/:id/password', (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Құпиясөз кемінде 6 символдан тұруы керек' });
    }
    const password_hash = bcrypt.hashSync(password, 10);
    const user = db.updateUser(req.params.id, { password_hash });
    if (!user) {
      return res.status(404).json({ error: 'Қолданушы табылмады' });
    }
    res.json({ message: 'Құпиясөз сәтті жаңартылды' });
  } catch (err) {
    console.error('Admin change password error:', err);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// GET /api/admin/users/:id/progress - Get comprehensive student progress & watch percentages
router.get('/users/:id/progress', (req, res) => {
  try {
    const details = db.getUserProgressDetails(req.params.id);
    if (!details) {
      return res.status(404).json({ error: 'Қолданушы табылмады' });
    }
    res.json(details);
  } catch (err) {
    console.error('Admin user progress error:', err);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// GET /api/admin/courses - ALL courses including unpublished
router.get('/courses', (req, res) => {
  try {
    const courses = db.getCourses({}); // return both published & unpublished
    res.json({ courses });
  } catch (err) {
    console.error('Admin courses error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/enrollments - Grant access to one or multiple courses
router.post('/enrollments', (req, res) => {
  try {
    const { user_id, course_id, course_ids } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id обязательно' });
    }

    const cIds = Array.isArray(course_ids) ? course_ids : (course_id ? [course_id] : []);

    if (cIds.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один курс' });
    }

    let addedCount = 0;
    for (const cId of cIds) {
      if (!db.isEnrolled(user_id, cId)) {
        db.enroll(user_id, cId);
        addedCount++;
      }
    }

    res.status(201).json({ message: `Доступ успешно открыт (${addedCount} курсов)` });
  } catch (err) {
    console.error('Manual enroll error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/enrollments/sync - Sync exact list of courses for a user
router.post('/enrollments/sync', (req, res) => {
  try {
    const { user_id, course_ids } = req.body;
    if (!user_id || !Array.isArray(course_ids)) {
      return res.status(400).json({ error: 'user_id и course_ids (array) обязательны' });
    }

    const uid = parseInt(user_id);
    const targetCourseIds = course_ids.map(id => parseInt(id));

    const data = db.get();
    // Remove enrollments not in targetCourseIds
    data.enrollments = data.enrollments.filter(e => {
      if (e.user_id !== uid) return true;
      return targetCourseIds.includes(e.course_id);
    });

    // Add missing enrollments
    for (const cid of targetCourseIds) {
      if (!data.enrollments.some(e => e.user_id === uid && e.course_id === cid)) {
        data.enrollments.push({
          id: (data.enrollments.reduce((max, e) => Math.max(max, e.id || 0), 0) || 0) + 1,
          user_id: uid,
          course_id: cid,
          enrolled_at: new Date().toISOString()
        });
      }
    }

    db.save(data);
    res.json({ message: 'Доступы успешно сохранены' });
  } catch (err) {
    console.error('Sync enrollments error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/enrollments - Remove single enrollment by user_id and course_id
router.delete('/enrollments/remove', (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    const uid = parseInt(user_id);
    const cid = parseInt(course_id);
    const data = db.get();
    data.enrollments = data.enrollments.filter(e => !(e.user_id === uid && e.course_id === cid));
    db.save(data);
    res.json({ message: 'Доступ к курсу закрыт' });
  } catch (err) {
    console.error('Remove enrollment error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
