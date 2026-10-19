import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiUserPlus, FiX, FiCheck, FiBookOpen, FiKey, FiLock } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Multi-course Access Management Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [savingAccess, setSavingAccess] = useState(false);

  // Change Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loadUsers = () => {
    const params = search ? `?search=${search}` : '';
    api.get(`/admin/users${params}`)
      .then(res => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [search]);

  useEffect(() => {
    api.get('/admin/courses').then(res => setCourses(res.data.courses)).catch(console.error);
  }, []);

  const openAccessModal = (user) => {
    setSelectedUser(user);
    const existingIds = (user.enrolled_courses || []).map(c => c.id);
    setSelectedCourseIds(existingIds);
  };

  const toggleCourseSelect = (courseId) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map(c => c.id));
    }
  };

  const handleSaveAccess = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSavingAccess(true);
    try {
      await api.post('/admin/enrollments/sync', {
        user_id: selectedUser.id,
        course_ids: selectedCourseIds
      });
      toast.success('Доступы к курсам успешно обновлены!');
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      toast.error('Ошибка сохранения доступов');
    } finally {
      setSavingAccess(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword || newPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put(`/admin/users/${passwordModalUser.id}/password`, { password: newPassword });
      toast.success(`Пароль для ${passwordModalUser.name} успешно обновлен!`);
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setSavingPassword(false);
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Роль пользователя изменена');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Пользователь удалён');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Пользователи и доступы к курсам
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Вы можете открывать ученику доступ сразу ко всем или нескольким выбранным предметам
          </p>
        </div>
      </div>

      {/* Multi-Course Access Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Управление доступами: <span className="text-blue-600">{selectedUser.name}</span>
                </h2>
                <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccess} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">
                  Выберите курсы, к которым будет открыт доступ:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {selectedCourseIds.length === courses.length ? 'Снять все' : 'Выбрать все курсы'}
                </button>
              </div>

              {/* Course Checkboxes List */}
              <div className="space-y-2">
                {courses.map(course => {
                  const isChecked = selectedCourseIds.includes(course.id);
                  return (
                    <label
                      key={course.id}
                      onClick={() => toggleCourseSelect(course.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-400/80 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && <FiCheck size={14} />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                            {course.title}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {course.category}
                          </span>
                        </div>
                        {course.duration && (
                          <p className="text-[11px] text-slate-400 mt-0.5">⏱ {course.duration}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Выбрано курсов: <span className="text-blue-600">{selectedCourseIds.length}</span> из {courses.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={savingAccess}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {savingAccess ? 'Сохранение...' : 'Сохранить доступы'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени или email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3.5">Ученик / Пользователь</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3.5">Телефон / Email</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3.5">Доступные курсы</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase px-6 py-3.5">Роль</th>
                <th className="text-right text-xs font-bold text-slate-500 uppercase px-6 py-3.5">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => {
                const enrolled = user.enrolled_courses || [];
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Регистрация: {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {user.phone ? (
                        <p className="font-bold text-slate-900 mb-0.5">{user.phone}</p>
                      ) : null}
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{user.email}</p>
                    </td>

                    {/* Enrolled Courses Badges */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                        {enrolled.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">Нет доступа</span>
                        ) : (
                          enrolled.map(c => (
                            <span
                              key={c.id}
                              className="inline-flex items-center text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                              title={c.title}
                            >
                              ✓ {c.category || c.title}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={e => changeRole(user.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="student">Ученик</option>
                        <option value="instructor">Преподаватель</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Change Password Button */}
                        <button
                          onClick={() => { setPasswordModalUser(user); setNewPassword(''); }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all flex items-center gap-1 border border-slate-200"
                          title="Сменить пароль ученика"
                        >
                          <FiKey size={13} className="text-amber-600" />
                          Пароль
                        </button>

                        <button
                          onClick={() => openAccessModal(user)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                          title="Выдать доступ к нескольким курсам"
                        >
                          <FiBookOpen size={13} />
                          Доступы ({enrolled.length})
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Удалить пользователя"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-10 text-center text-xs text-slate-400">Пользователи не найдены</div>
        )}
      </div>

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Сменить пароль: <span className="text-blue-600">{passwordModalUser.name}</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  {passwordModalUser.phone || passwordModalUser.email}
                </p>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Жаңа құпиясөз (Новый пароль)
              </label>
              <div className="relative mb-4">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {savingPassword ? 'Сохранение...' : 'Сақтау (Сохранить)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
