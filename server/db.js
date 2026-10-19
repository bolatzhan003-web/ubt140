require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_FILE = path.join(__dirname, '..', 'lms_database.json');

const initialData = {
  users: [],
  courses: [],
  sections: [],
  lessons: [],
  assignments: [],
  materials: [],
  enrollments: [],
  progress: [],
  assignment_submissions: []
};

// In-memory cache for instantaneous route responses
let memoryDb = null;
let pgPool = null;

// Initialize PostgreSQL if DATABASE_URL is provided (Neon / Supabase / Render Postgres)
const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    pgPool.query(`
      CREATE TABLE IF NOT EXISTS lms_state (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `).then(async () => {
      console.log('🐘 PostgreSQL успешно подключен к облаку!');
      const res = await pgPool.query('SELECT data FROM lms_state WHERE key = $1', ['main']);
      if (res.rows.length > 0 && res.rows[0].data) {
        console.log('📥 База данных загружена из облачного PostgreSQL');
        memoryDb = res.rows[0].data;
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
        } catch {}
      } else {
        const currentData = readFromFile();
        await pgPool.query(
          'INSERT INTO lms_state (key, data, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()',
          ['main', JSON.stringify(currentData)]
        );
        console.log('📤 Начальные данные курсов и пользователей синхронизированы с облаком PostgreSQL');
      }
    }).catch(err => {
      console.error('Ошибка инициализации таблицы в PostgreSQL:', err.message);
    });
  } catch (err) {
    console.error('Ошибка подключения к PostgreSQL:', err.message);
  }
}

function readFromFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(initialData));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return JSON.parse(JSON.stringify(initialData));
  }
}

function readDb() {
  if (!memoryDb) {
    memoryDb = readFromFile();
  }
  return memoryDb;
}

function writeDb(data) {
  memoryDb = data;

  // 1. Save to local file atomically
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    try {
      fs.renameSync(tempFile, DB_FILE);
    } catch {
      fs.copyFileSync(tempFile, DB_FILE);
      try { fs.unlinkSync(tempFile); } catch {}
    }
  } catch (err) {
    console.error('File write err:', err.message);
  }

  // 2. Persist to cloud PostgreSQL if connected
  if (pgPool) {
    pgPool.query(
      'INSERT INTO lms_state (key, data, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()',
      ['main', JSON.stringify(data)]
    ).catch(err => {
      console.error('PostgreSQL cloud save err:', err.message);
    });
  }
}

const db = {
  get: () => readDb(),
  save: (data) => writeDb(data),

  // Phone normalization: +7 (7XX) XXX-XX-XX -> 77XXXXXXXXX
  normalizePhone: (phone) => {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
      digits = '7' + digits.slice(1);
    }
    return digits;
  },

  // Users
  findUserByEmail: (email) => {
    if (!email) return null;
    const data = readDb();
    return data.users.find(u => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  },
  findUserByPhone: (phone) => {
    if (!phone) return null;
    const data = readDb();
    const clean = db.normalizePhone(phone);
    if (!clean) return null;
    return data.users.find(u => {
      if (u.phone && db.normalizePhone(u.phone) === clean) return true;
      if (u.phone_normalized && u.phone_normalized === clean) return true;
      return false;
    });
  },
  findUserByLogin: (login) => {
    if (!login) return null;
    const str = String(login).trim();
    if (str.includes('@')) {
      return db.findUserByEmail(str);
    }
    const byPhone = db.findUserByPhone(str);
    if (byPhone) return byPhone;
    return db.findUserByEmail(str);
  },
  findUserById: (id) => {
    const data = readDb();
    return data.users.find(u => u.id === parseInt(id));
  },
  createUser: ({ name, phone = null, email = null, password_hash, role = 'student', avatar = null }) => {
    const data = readDb();
    const id = (data.users.reduce((max, u) => Math.max(max, u.id || 0), 0) || 0) + 1;
    const cleanPhone = phone ? db.normalizePhone(phone) : null;
    const userEmail = email || (cleanPhone ? `user_${cleanPhone}@ubt140.kz` : `user_${id}@ubt140.kz`);
    const user = {
      id,
      name,
      phone: phone || null,
      phone_normalized: cleanPhone,
      email: userEmail,
      password_hash,
      role,
      avatar,
      created_at: new Date().toISOString()
    };
    data.users.push(user);
    writeDb(data);
    return user;
  },
  updateUser: (id, updates) => {
    const data = readDb();
    const idx = data.users.findIndex(u => u.id === parseInt(id));
    if (idx !== -1) {
      if (updates.phone) {
        updates.phone_normalized = db.normalizePhone(updates.phone);
      }
      data.users[idx] = { ...data.users[idx], ...updates };
      writeDb(data);
      return data.users[idx];
    }
    return null;
  },
  deleteUser: (id) => {
    const data = readDb();
    const userId = parseInt(id);
    data.users = data.users.filter(u => u.id !== userId);
    data.enrollments = data.enrollments.filter(e => e.user_id !== userId);
    data.progress = data.progress.filter(p => p.user_id !== userId);
    data.assignment_submissions = data.assignment_submissions.filter(s => s.user_id !== userId);
    writeDb(data);
  },

  // Courses
  getCourses: (filters = {}) => {
    const data = readDb();
    let courses = [...data.courses];

    if (filters.is_published !== undefined) {
      courses = courses.filter(c => Boolean(c.is_published) === Boolean(filters.is_published));
    }
    if (filters.category) {
      courses = courses.filter(c => c.category === filters.category);
    }
    if (filters.level) {
      courses = courses.filter(c => c.level === filters.level);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      courses = courses.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) || 
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return courses.map(c => {
      const instructor = data.users.find(u => u.id === c.instructor_id);
      const courseSections = data.sections.filter(s => s.course_id === c.id);
      const sectionIds = courseSections.map(s => s.id);
      const lessonCount = data.lessons.filter(l => sectionIds.includes(l.section_id)).length;
      const studentCount = data.enrollments.filter(e => e.course_id === c.id).length;

      return {
        ...c,
        instructor_name: instructor ? instructor.name : 'Преподаватель SkillFlow',
        section_count: courseSections.length,
        lesson_count: lessonCount,
        student_count: studentCount
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getCourseById: (id) => {
    const data = readDb();
    const courseId = parseInt(id);
    const course = data.courses.find(c => c.id === courseId);
    if (!course) return null;

    const instructor = data.users.find(u => u.id === course.instructor_id);
    const sections = data.sections
      .filter(s => s.course_id === courseId)
      .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));

    const enrichedSections = sections.map(s => {
      const lessons = data.lessons
        .filter(l => l.section_id === s.id)
        .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      return { ...s, lessons };
    });

    const lessonCount = enrichedSections.reduce((acc, s) => acc + s.lessons.length, 0);
    const studentCount = data.enrollments.filter(e => e.course_id === courseId).length;

    return {
      course: {
        ...course,
        instructor_name: instructor ? instructor.name : 'Преподаватель SkillFlow',
        lesson_count: lessonCount,
        student_count: studentCount
      },
      sections: enrichedSections
    };
  },

  createCourse: (courseData) => {
    const data = readDb();
    const id = (data.courses.reduce((max, c) => Math.max(max, c.id || 0), 0) || 0) + 1;
    const newCourse = {
      id,
      title: courseData.title,
      description: courseData.description || '',
      thumbnail: courseData.thumbnail || '',
      category: courseData.category || 'Программирование',
      level: courseData.level || 'Начинающий',
      duration: courseData.duration || '',
      instructor_id: courseData.instructor_id || 1,
      is_published: courseData.is_published ? 1 : 0,
      created_at: new Date().toISOString()
    };
    data.courses.push(newCourse);
    writeDb(data);
    return newCourse;
  },

  updateCourse: (id, updates) => {
    const data = readDb();
    const idx = data.courses.findIndex(c => c.id === parseInt(id));
    if (idx !== -1) {
      data.courses[idx] = { ...data.courses[idx], ...updates };
      writeDb(data);
      return data.courses[idx];
    }
    return null;
  },

  deleteCourse: (id) => {
    const data = readDb();
    const courseId = parseInt(id);
    const sectionIds = data.sections.filter(s => s.course_id === courseId).map(s => s.id);
    const lessonIds = data.lessons.filter(l => sectionIds.includes(l.section_id)).map(l => l.id);

    data.courses = data.courses.filter(c => c.id !== courseId);
    data.sections = data.sections.filter(s => s.course_id !== courseId);
    data.lessons = data.lessons.filter(l => !sectionIds.includes(l.section_id));
    data.assignments = data.assignments.filter(a => !lessonIds.includes(a.lesson_id));
    data.materials = data.materials.filter(m => !lessonIds.includes(m.lesson_id));
    data.enrollments = data.enrollments.filter(e => e.course_id !== courseId);
    writeDb(data);
  },

  // Enrollments & Progress
  getUserEnrollments: (userId) => {
    const data = readDb();
    const uid = parseInt(userId);
    const enrollments = data.enrollments.filter(e => e.user_id === uid);

    return enrollments.map(e => {
      const course = data.courses.find(c => c.id === e.course_id);
      if (!course) return null;
      const instructor = data.users.find(u => u.id === course.instructor_id);
      const sections = data.sections.filter(s => s.course_id === course.id);
      const sectionIds = sections.map(s => s.id);
      const courseLessons = data.lessons.filter(l => sectionIds.includes(l.section_id));
      const lessonIds = courseLessons.map(l => l.id);

      const completedCount = data.progress.filter(p => 
        p.user_id === uid && lessonIds.includes(p.lesson_id) && p.completed
      ).length;

      return {
        ...course,
        instructor_name: instructor ? instructor.name : '',
        enrolled_at: e.enrolled_at,
        lesson_count: courseLessons.length,
        completed_count: completedCount
      };
    }).filter(Boolean);
  },

  isEnrolled: (userId, courseId) => {
    const data = readDb();
    return Boolean(data.enrollments.find(e => e.user_id === parseInt(userId) && e.course_id === parseInt(courseId)));
  },

  enroll: (userId, courseId) => {
    const data = readDb();
    const uid = parseInt(userId);
    const cid = parseInt(courseId);
    if (!data.enrollments.some(e => e.user_id === uid && e.course_id === cid)) {
      data.enrollments.push({
        id: (data.enrollments.reduce((max, e) => Math.max(max, e.id || 0), 0) || 0) + 1,
        user_id: uid,
        course_id: cid,
        enrolled_at: new Date().toISOString()
      });
      writeDb(data);
    }
  },

  deleteEnrollment: (id) => {
    const data = readDb();
    data.enrollments = data.enrollments.filter(e => e.id !== parseInt(id));
    writeDb(data);
  },

  getCourseProgress: (userId, courseId) => {
    const data = readDb();
    const uid = parseInt(userId);
    const cid = parseInt(courseId);
    const sections = data.sections.filter(s => s.course_id === cid);
    const sectionIds = sections.map(s => s.id);
    const lessons = data.lessons.filter(l => sectionIds.includes(l.section_id));

    return lessons.map(l => {
      const prog = data.progress.find(p => p.user_id === uid && p.lesson_id === l.id);
      return {
        lesson_id: l.id,
        completed: prog ? prog.completed : 0,
        completed_at: prog ? prog.completed_at : null,
        watch_percent: prog ? (prog.watch_percent || (prog.completed ? 100 : 0)) : 0,
        last_position_sec: prog ? (prog.last_position_sec || 0) : 0,
        duration_sec: prog ? (prog.duration_sec || 0) : 0
      };
    });
  },

  updateLessonProgress: (userId, lessonId, { percent = 0, currentTime = 0, duration = 0 }) => {
    const data = readDb();
    const uid = parseInt(userId);
    const lid = parseInt(lessonId);
    const cleanPercent = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));
    const cleanTime = Math.max(0, Math.round(Number(currentTime) || 0));
    const cleanDuration = Math.max(0, Math.round(Number(duration) || 0));

    let prog = data.progress.find(p => p.user_id === uid && p.lesson_id === lid);
    const isNowCompleted = cleanPercent >= 80;

    if (prog) {
      prog.watch_percent = Math.max(prog.watch_percent || 0, cleanPercent);
      if (cleanTime > 0) prog.last_position_sec = cleanTime;
      if (cleanDuration > 0) prog.duration_sec = cleanDuration;
      if (isNowCompleted && !prog.completed) {
        prog.completed = 1;
        prog.completed_at = new Date().toISOString();
      }
      prog.updated_at = new Date().toISOString();
    } else {
      prog = {
        id: (data.progress.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1,
        user_id: uid,
        lesson_id: lid,
        watch_percent: cleanPercent,
        last_position_sec: cleanTime,
        duration_sec: cleanDuration,
        completed: isNowCompleted ? 1 : 0,
        completed_at: isNowCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };
      data.progress.push(prog);
    }
    writeDb(data);
    return prog;
  },

  markLessonComplete: (userId, lessonId) => {
    const data = readDb();
    const uid = parseInt(userId);
    const lid = parseInt(lessonId);
    let prog = data.progress.find(p => p.user_id === uid && p.lesson_id === lid);
    if (prog) {
      prog.completed = 1;
      prog.watch_percent = Math.max(prog.watch_percent || 0, 100);
      prog.completed_at = new Date().toISOString();
      prog.updated_at = new Date().toISOString();
    } else {
      data.progress.push({
        id: (data.progress.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1,
        user_id: uid,
        lesson_id: lid,
        watch_percent: 100,
        completed: 1,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    writeDb(data);
  },

  getUserProgressDetails: (userId) => {
    const data = readDb();
    const uid = parseInt(userId);
    const user = data.users.find(u => u.id === uid);
    if (!user) return null;

    const userEnrollments = data.enrollments.filter(e => e.user_id === uid);
    const coursesProgress = userEnrollments.map(e => {
      const course = data.courses.find(c => c.id === e.course_id);
      if (!course) return null;

      const courseSections = data.sections.filter(s => s.course_id === course.id);
      const sectionIds = courseSections.map(s => s.id);
      const courseLessons = data.lessons.filter(l => sectionIds.includes(l.section_id));

      const lessonDetails = courseLessons.map(l => {
        const prog = data.progress.find(p => p.user_id === uid && p.lesson_id === l.id);
        return {
          lesson_id: l.id,
          title: l.title,
          video_url: l.video_url,
          duration: l.duration,
          completed: prog ? prog.completed : 0,
          completed_at: prog ? prog.completed_at : null,
          watch_percent: prog ? (prog.watch_percent || (prog.completed ? 100 : 0)) : 0
        };
      });

      const totalLessons = courseLessons.length;
      const completedCount = lessonDetails.filter(l => l.completed).length;
      const totalWatchPercent = totalLessons > 0
        ? Math.round(lessonDetails.reduce((sum, l) => sum + (l.watch_percent || 0), 0) / totalLessons)
        : 0;

      return {
        course_id: course.id,
        course_title: course.title,
        category: course.category,
        thumbnail: course.thumbnail,
        enrolled_at: e.enrolled_at,
        total_lessons: totalLessons,
        completed_count: completedCount,
        progress_percent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
        average_watch_percent: totalWatchPercent,
        lessons: lessonDetails
      };
    }).filter(Boolean);

    // Compute achievements
    const allProgress = data.progress.filter(p => p.user_id === uid);
    const totalCompletedLessons = allProgress.filter(p => p.completed).length;
    const completedCoursesCount = coursesProgress.filter(c => c.progress_percent === 100).length;
    const submissions = (data.assignment_submissions || []).filter(s => s.user_id === uid);

    const achievements = [
      {
        id: 'first_lesson',
        title: 'Алғашқы қадам',
        desc: 'Алғашқы видеосабақты 80%+ көріп аяқтау',
        icon: '🚀',
        unlocked: totalCompletedLessons >= 1,
        progress: Math.min(1, totalCompletedLessons) + '/1'
      },
      {
        id: 'pace_5',
        title: 'Қарқынды оқу',
        desc: 'Кемінде 5 сабақты толық игеру',
        icon: '⚡',
        unlocked: totalCompletedLessons >= 5,
        progress: Math.min(5, totalCompletedLessons) + '/5'
      },
      {
        id: 'half_way',
        title: 'Экватор — Жарты жол',
        desc: 'Курстың 50%-дан астамын аяқтау',
        icon: '🎯',
        unlocked: coursesProgress.some(c => c.progress_percent >= 50),
        progress: coursesProgress.length > 0 ? Math.max(...coursesProgress.map(c => c.progress_percent), 0) + '%' : '0%'
      },
      {
        id: 'champion_140',
        title: 'ҰБТ 140 Чемпионы',
        desc: 'Курсты 100% толық аяқтау',
        icon: '🏆',
        unlocked: completedCoursesCount >= 1,
        progress: completedCoursesCount + ' курс'
      },
      {
        id: 'test_master',
        title: 'Тест шебері',
        desc: 'Бекіту тапсырмасын сәтті орындау',
        icon: '📝',
        unlocked: submissions.length >= 1,
        progress: submissions.length + ' тапсырма'
      }
    ];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at
      },
      courses: coursesProgress,
      stats: {
        enrolled_courses_count: coursesProgress.length,
        total_completed_lessons: totalCompletedLessons,
        completed_courses_count: completedCoursesCount,
        submissions_count: submissions.length
      },
      achievements
    };
  },

  // Sections & Lessons
  createSection: ({ course_id, title, description, order_num }) => {
    const data = readDb();
    const cid = parseInt(course_id);
    const maxOrder = data.sections.filter(s => s.course_id === cid).reduce((m, s) => Math.max(m, s.order_num || 0), 0);
    const section = {
      id: (data.sections.reduce((max, s) => Math.max(max, s.id || 0), 0) || 0) + 1,
      course_id: cid,
      title,
      description: description || '',
      order_num: order_num !== undefined ? order_num : maxOrder + 1
    };
    data.sections.push(section);
    writeDb(data);
    return section;
  },

  updateSection: (id, updates) => {
    const data = readDb();
    const idx = data.sections.findIndex(s => s.id === parseInt(id));
    if (idx !== -1) {
      data.sections[idx] = { ...data.sections[idx], ...updates };
      writeDb(data);
      return data.sections[idx];
    }
    return null;
  },

  deleteSection: (id) => {
    const data = readDb();
    const sid = parseInt(id);
    const lessons = data.lessons.filter(l => l.section_id === sid);
    const lessonIds = lessons.map(l => l.id);

    data.sections = data.sections.filter(s => s.id !== sid);
    data.lessons = data.lessons.filter(l => l.section_id !== sid);
    data.assignments = data.assignments.filter(a => !lessonIds.includes(a.lesson_id));
    data.materials = data.materials.filter(m => !lessonIds.includes(m.lesson_id));
    writeDb(data);
  },

  createLesson: ({ section_id, title, description, video_url, content, duration, order_num }) => {
    const data = readDb();
    const sid = parseInt(section_id);
    const maxOrder = data.lessons.filter(l => l.section_id === sid).reduce((m, l) => Math.max(m, l.order_num || 0), 0);
    const lesson = {
      id: (data.lessons.reduce((max, l) => Math.max(max, l.id || 0), 0) || 0) + 1,
      section_id: sid,
      title,
      description: description || '',
      video_url: video_url || '',
      content: content || '',
      duration: duration || '',
      order_num: order_num !== undefined ? order_num : maxOrder + 1
    };
    data.lessons.push(lesson);
    writeDb(data);
    return lesson;
  },

  getLessonById: (id, userId) => {
    const data = readDb();
    const lid = parseInt(id);
    const uid = parseInt(userId);
    const lesson = data.lessons.find(l => l.id === lid);
    if (!lesson) return null;

    const section = data.sections.find(s => s.id === lesson.section_id);
    const course = section ? data.courses.find(c => c.id === section.course_id) : null;

    const assignments = data.assignments.filter(a => a.lesson_id === lid).map(a => {
      const sub = data.assignment_submissions.find(s => s.assignment_id === a.id && s.user_id === uid);
      return { ...a, submission: sub || null };
    });

    const materials = data.materials.filter(m => m.lesson_id === lid);
    const prog = data.progress.find(p => p.user_id === uid && p.lesson_id === lid);

    let prevLesson = null;
    let nextLesson = null;

    if (course) {
      const courseSections = data.sections
        .filter(s => s.course_id === course.id)
        .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
      
      const allLessons = [];
      for (const s of courseSections) {
        const secLessons = data.lessons
          .filter(l => l.section_id === s.id)
          .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
        allLessons.push(...secLessons);
      }

      const cIdx = allLessons.findIndex(l => l.id === lid);
      if (cIdx > 0) prevLesson = allLessons[cIdx - 1];
      if (cIdx !== -1 && cIdx < allLessons.length - 1) nextLesson = allLessons[cIdx + 1];
    }

    return {
      lesson,
      assignments,
      materials,
      progress: prog || null,
      course: course ? { id: course.id, title: course.title } : null,
      prevLesson,
      nextLesson
    };
  },

  updateLesson: (id, updates) => {
    const data = readDb();
    const idx = data.lessons.findIndex(l => l.id === parseInt(id));
    if (idx !== -1) {
      data.lessons[idx] = { ...data.lessons[idx], ...updates };
      writeDb(data);
      return data.lessons[idx];
    }
    return null;
  },

  deleteLesson: (id) => {
    const data = readDb();
    const lid = parseInt(id);
    data.lessons = data.lessons.filter(l => l.id !== lid);
    data.assignments = data.assignments.filter(a => a.lesson_id !== lid);
    data.materials = data.materials.filter(m => m.lesson_id !== lid);
    data.progress = data.progress.filter(p => p.lesson_id !== lid);
    writeDb(data);
  },

  // Assignments & Materials
  createAssignment: ({ lesson_id, title, description, type = 'text' }) => {
    const data = readDb();
    const assignment = {
      id: (data.assignments.reduce((max, a) => Math.max(max, a.id || 0), 0) || 0) + 1,
      lesson_id: parseInt(lesson_id),
      title,
      description: description || '',
      type
    };
    data.assignments.push(assignment);
    writeDb(data);
    return assignment;
  },

  submitAssignment: ({ assignment_id, user_id, content }) => {
    const data = readDb();
    const aid = parseInt(assignment_id);
    const uid = parseInt(user_id);
    let sub = data.assignment_submissions.find(s => s.assignment_id === aid && s.user_id === uid);
    if (sub) {
      sub.content = content;
      sub.submitted_at = new Date().toISOString();
    } else {
      sub = {
        id: (data.assignment_submissions.reduce((max, s) => Math.max(max, s.id || 0), 0) || 0) + 1,
        assignment_id: aid,
        user_id: uid,
        content,
        submitted_at: new Date().toISOString(),
        grade: null,
        feedback: null
      };
      data.assignment_submissions.push(sub);
    }
    writeDb(data);
    return sub;
  },

  createMaterial: ({ lesson_id, title, filename, filepath, filetype }) => {
    const data = readDb();
    const mat = {
      id: (data.materials.reduce((max, m) => Math.max(max, m.id || 0), 0) || 0) + 1,
      lesson_id: parseInt(lesson_id),
      title,
      filename,
      filepath,
      filetype
    };
    data.materials.push(mat);
    writeDb(data);
    return mat;
  },

  deleteMaterial: (id) => {
    const data = readDb();
    const mid = parseInt(id);
    const mat = data.materials.find(m => m.id === mid);
    data.materials = data.materials.filter(m => m.id !== mid);
    writeDb(data);
    return mat;
  },

  // Stats
  getStats: () => {
    const data = readDb();
    const recentEnrollments = [...data.enrollments]
      .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at))
      .slice(0, 10)
      .map(e => {
        const u = data.users.find(usr => usr.id === e.user_id);
        const c = data.courses.find(crs => crs.id === e.course_id);
        return {
          id: e.id,
          enrolled_at: e.enrolled_at,
          user_name: u ? u.name : 'Пользователь',
          user_email: u ? u.email : '',
          course_title: c ? c.title : 'Курс'
        };
      });

    return {
      stats: {
        totalUsers: data.users.length,
        totalCourses: data.courses.length,
        publishedCourses: data.courses.filter(c => c.is_published).length,
        totalEnrollments: data.enrollments.length,
        totalLessons: data.lessons.length
      },
      recentEnrollments
    };
  }
};

module.exports = db;
