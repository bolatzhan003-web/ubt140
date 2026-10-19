import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { SUBJECTS_LIST } from '../../translations';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'Математикалық сауаттылық',
    duration: ''
  });

  const loadCourses = () => {
    api.get('/admin/courses')
      .then(res => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', form);
      toast.success('Жаңа курс сәтті қосылды!');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        thumbnail: '',
        category: 'Математикалық сауаттылық',
        duration: ''
      });
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Қате');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Бұл курсты және оның барлық бөлімдерін өшіруді растайсыз ба?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Курс өшірілді');
      loadCourses();
    } catch (err) {
      toast.error('Өшіру қатесі');
    }
  };

  const togglePublish = async (course) => {
    try {
      await api.put(`/courses/${course.id}`, { is_published: !course.is_published });
      toast.success(course.is_published ? 'Курс жабылды (черновик)' : 'Курс жарияланды!');
      loadCourses();
    } catch (err) {
      toast.error('Қате');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ҰБТ Курстарын басқару
          </h1>
          <p className="text-slate-500 text-sm mt-1">Пәндер, бейнедәрістер және материалдар</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-2xl text-sm font-bold hover:bg-sky-700 shadow-md transition-all"
        >
          <FiPlus size={18} /> Жаңа курс қосу
        </button>
      </div>

      {/* Create Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Жаңа курс қосу</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Курс / Пән тақырыбы *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Мысалы: Математикалық сауаттылық — Толық дайындық"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ҰБТ Пәні *
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                >
                  {SUBJECTS_LIST.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Бұл курста оқушы не үйренеді..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Мұқаба суретінің URL (Обложка)</label>
                <input
                  type="text"
                  value={form.thumbnail}
                  onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Сағат саны</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  placeholder="мысалы: 45 сағат немесе 30 сабақ"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-600 text-white font-bold rounded-2xl hover:bg-sky-700 shadow-md transition-all"
              >
                Курсты құру
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-4">Курс</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-4">Пән</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-4">Сабақ саны</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-4">Оқушылар</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-4">Күйі</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-4">Басқару</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail && (
                          <img src={course.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{course.title}</p>
                          <p className="text-xs text-slate-400">👨‍🏫 {course.instructor_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-sky-800">
                      <span className="bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {course.lesson_count || 0} сабақ
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {course.student_count || 0} оқушы
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                        course.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {course.is_published ? 'Жарияланған' : 'Жабық (черновик)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => togglePublish(course)}
                          className="p-2 text-slate-400 hover:text-sky-600 transition-colors rounded-lg hover:bg-slate-100"
                          title={course.is_published ? 'Скрыть курс' : 'Опубликовать'}
                        >
                          {course.is_published ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
                          title="Редактировать курс и уроки"
                        >
                          <FiEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-100"
                          title="Удалить"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {courses.length === 0 && (
            <div className="p-12 text-center text-slate-400">Курстар әлі қосылмаған</div>
          )}
        </div>
      )}
    </div>
  );
}
