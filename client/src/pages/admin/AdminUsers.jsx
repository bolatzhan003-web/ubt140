import { useState, useEffect } from 'react';
import { 
  FiSearch, FiTrash2, FiUserPlus, FiX, FiCheck, FiBookOpen, 
  FiKey, FiLock, FiPhone, FiUser, FiTrendingUp, FiAward, FiVideo, FiCheckCircle 
} from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { formatKazakhstanPhone } from '../../utils/phone';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Student Progress Modal
  const [progressModalUser, setProgressModalUser] = useState(null);
  const [userProgressData, setUserProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  
  // Multi-course Access Management Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [savingAccess, setSavingAccess] = useState(false);

  // Change Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'student',
    course_ids: []
  });
  const [creatingUser, setCreatingUser] = useState(false);

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

  const openProgressModal = async (user) => {
    setProgressModalUser(user);
    setLoadingProgress(true);
    setUserProgressData(null);
    try {
      const res = await api.get(`/admin/users/${user.id}/progress`);
      setUserProgressData(res.data);
    } catch (err) {
      toast.error('Прогресс деректерін жүктеу қатесі');
    } finally {
      setLoadingProgress(false);
    }
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.name || (!createForm.phone && !createForm.email) || !createForm.password) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    if (createForm.password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    setCreatingUser(true);
    try {
      await api.post('/admin/users', createForm);
      toast.success('Пользователь успешно создан!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'student',
        course_ids: []
      });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка создания пользователя');
    } finally {
      setCreatingUser(false);
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
            Вы можете создавать пользователей и открывать доступ к предметам
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <FiUserPlus size={16} /> Қолданушы қосу (Создать пользователя)
        </button>
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
                        {/* Student Progress Button */}
                        <button
                          onClick={() => openProgressModal(user)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all flex items-center gap-1 border border-emerald-200"
                          title="Оқушының прогресі мен видео көру пайызын көру"
                        >
                          <FiTrendingUp size={13} className="text-emerald-600" />
                          Прогресс
                        </button>

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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Қолданушы қосу (Создать пользователя)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Ученик, преподаватель или администратор
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Аты-жөні (ФИО) *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    placeholder="Мысалы: Арман Серікұлы"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Телефон нөмірі (WhatsApp) *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: formatKazakhstanPhone(e.target.value) })}
                    required
                    placeholder="+7 (7XX) XXX-XX-XX"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Role & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Рөлі (Роль) *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="student">Оқушы (Ученик)</option>
                    <option value="instructor">Оқытушы (Преподаватель)</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Құпиясөз (Пароль) *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={createForm.password}
                      onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                      placeholder="Кемінде 6 таңба"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Immediate Course Assignment */}
              {createForm.role === 'student' && courses.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Бірден курсқа қолжетімділік беру (необязательно)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (createForm.course_ids.length === courses.length) {
                          setCreateForm({ ...createForm, course_ids: [] });
                        } else {
                          setCreateForm({ ...createForm, course_ids: courses.map(c => c.id) });
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      {createForm.course_ids.length === courses.length ? 'Барлығын өшіру' : 'Барлығын таңдау'}
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {courses.map(course => {
                      const checked = createForm.course_ids.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            checked ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold' : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const ids = checked
                                ? createForm.course_ids.filter(id => id !== course.id)
                                : [...createForm.course_ids, course.id];
                              setCreateForm({ ...createForm, course_ids: ids });
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="truncate">{course.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Болдырмау (Отмена)
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {creatingUser ? 'Қосылуда...' : 'Қолданушыны қосу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Progress & Achievements Modal */}
      {progressModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {progressModalUser.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">{progressModalUser.name}</h2>
                  <p className="text-xs text-slate-500">
                    {progressModalUser.phone || progressModalUser.email} • Оқу үлгерімі мен видео көру деңгейі
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setProgressModalUser(null)} 
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loadingProgress ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Прогресс деректері жүктелуде...</p>
                </div>
              ) : userProgressData ? (
                <>
                  {/* Summary Stat Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-900">{userProgressData.stats.enrolled_courses_count}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Курсқа қатысады</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-emerald-600">{userProgressData.stats.total_completed_lessons}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Өтілген сабақ</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-blue-600">{userProgressData.stats.completed_courses_count}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Аяқталған курс</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-amber-600">
                        {userProgressData.achievements.filter(a => a.unlocked).length}/{userProgressData.achievements.length}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">Жетістіктер</p>
                    </div>
                  </div>

                  {/* Achievements Badges */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <FiAward className="text-amber-500" /> Оқушының бейдждері
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {userProgressData.achievements.map(a => (
                        <div
                          key={a.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                            a.unlocked
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <span className="text-lg">{a.icon}</span>
                          <div className="truncate">
                            <p className="truncate text-[11px] leading-tight">{a.title}</p>
                            <p className="text-[9px] text-slate-400 font-normal truncate">{a.unlocked ? 'Ашылған' : a.progress}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course by Course Breakdown */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Курстар мен бейнесабақтарды көру пайызы
                    </h3>
                    {userProgressData.courses.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Оқушы әлі ешбір курсқа жазылмаған</p>
                    ) : (
                      <div className="space-y-4">
                        {userProgressData.courses.map(c => (
                          <div key={c.course_id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-bold text-xs text-slate-900 truncate">{c.course_title}</span>
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                {c.completed_count}/{c.total_lessons} ({c.progress_percent}%)
                              </span>
                            </div>

                            {/* Overall progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${c.progress_percent}%` }}
                              />
                            </div>

                            {/* Lessons List */}
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {c.lessons.map((les, idx) => (
                                <div
                                  key={les.lesson_id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100"
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    {les.completed || les.watch_percent >= 80 ? (
                                      <FiCheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                                    ) : (
                                      <FiVideo size={13} className="text-slate-400 flex-shrink-0" />
                                    )}
                                    <span className="truncate text-slate-700 text-[11px] font-medium">
                                      {idx + 1}. {les.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          les.completed || les.watch_percent >= 80 ? 'bg-emerald-500' : 'bg-sky-500'
                                        }`}
                                        style={{ width: `${les.watch_percent}%` }}
                                      />
                                    </div>
                                    <span className={`text-[10px] font-bold w-9 text-right ${
                                      les.completed || les.watch_percent >= 80 ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                                    }`}>
                                      {les.watch_percent}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setProgressModalUser(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-sm"
              >
                Жабу (Закрыть)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
