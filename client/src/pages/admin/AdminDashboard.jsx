import { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiUserCheck, FiPlay } from 'react-icons/fi';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        setStats(res.data.stats);
        setEnrollments(res.data.recentEnrollments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Пользователи', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-500' },
    { label: 'Курсы', value: stats?.totalCourses || 0, icon: FiBook, color: 'bg-green-500' },
    { label: 'Записи', value: stats?.totalEnrollments || 0, icon: FiUserCheck, color: 'bg-purple-500' },
    { label: 'Уроки', value: stats?.totalLessons || 0, icon: FiPlay, color: 'bg-orange-500' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Дашборд</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent enrollments */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Последние записи на курсы</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {enrollments.length === 0 ? (
            <div className="p-5 text-center text-gray-400">Нет записей</div>
          ) : (
            enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {e.user_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.user_name}</p>
                    <p className="text-xs text-gray-500">{e.user_email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{e.course_title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.enrolled_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
