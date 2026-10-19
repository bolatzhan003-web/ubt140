import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCheck, FiArrowRight } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/CourseCard';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my')
      .then(res => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalCompleted = courses.reduce((acc, c) => acc + (c.completed_count || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.lesson_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои курсы</h1>
      <p className="text-gray-500 mb-8">Ваши курсы и прогресс обучения</p>

      {/* Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiBook className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-sm text-gray-500">Курсов</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheck className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
                <p className="text-sm text-gray-500">Уроков пройдено</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiArrowRight className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalLessons - totalCompleted}</p>
                <p className="text-sm text-gray-500">Осталось</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">У вас пока нет курсов</h3>
          <p className="text-gray-500 mb-6">Запишитесь на курс, чтобы начать обучение</p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Перейти в каталог <FiArrowRight className="ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
