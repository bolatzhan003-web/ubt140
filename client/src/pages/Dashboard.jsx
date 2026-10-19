import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCheck, FiArrowRight, FiAward, FiTrendingUp, FiVideo, FiCheckCircle } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLang } from '../context/LanguageContext';

export default function Dashboard() {
  const { lang } = useLang();
  const isKz = lang === 'kz';

  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'achievements'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses/my').catch(() => ({ data: { courses: [] } })),
      api.get('/achievements/my').catch(() => ({ data: null }))
    ])
      .then(([cRes, aRes]) => {
        setCourses(cRes.data?.courses || []);
        setAnalytics(aRes.data || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCompleted = courses.reduce((acc, c) => acc + (c.completed_count || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.lesson_count || 0), 0);
  const totalCourses = courses.length;
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isKz ? 'Оқу панелі және жетістіктер' : 'Мое обучение и достижения'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isKz 
              ? 'ҰБТ-ға дайындық қарқыны, қаралған бейнесабақтар және марапаттар' 
              : 'Прогресс подготовки к ЕНТ, просмотр видеоуроков и полученные награды'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiBook size={14} /> {isKz ? 'Менің курстарым' : 'Мои курсы'} ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'achievements'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiAward size={14} /> {isKz ? 'Жетістіктер' : 'Достижения'}
            {analytics?.achievements && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {analytics.achievements.filter(a => a.unlocked).length}/{analytics.achievements.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FiBook size={18} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{totalCourses}</p>
              <p className="text-xs text-slate-400">{isKz ? 'Белсенді курстар' : 'Активных курсов'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiCheckCircle size={18} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{totalCompleted}</p>
              <p className="text-xs text-slate-400">{isKz ? 'Өтілген сабақтар' : 'Уроков пройдено'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiTrendingUp size={18} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{overallPercent}%</p>
              <p className="text-xs text-slate-400">{isKz ? 'Жалпы прогресс' : 'Общий прогресс'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FiAward size={18} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {analytics?.achievements?.filter(a => a.unlocked).length || 0}
              </p>
              <p className="text-xs text-slate-400">{isKz ? 'Медальдар' : 'Награды'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div>
          {courses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {isKz ? 'Сізде әзірше белсенді курс жоқ' : 'У вас пока нет курсов'}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                {isKz 
                  ? 'Каталогқа өтіп, ҰБТ пәндерін таңдаңыз немесе әкімшімен байланысыңыз' 
                  : 'Запишитесь на курс, чтобы начать подготовку к ЕНТ'}
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
              >
                {isKz ? 'Каталогты көру' : 'Перейти в каталог'} <FiArrowRight />
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
      )}

      {/* Tab: Achievements & Progress */}
      {activeTab === 'achievements' && (
        <div className="space-y-8 animate-fade-in">
          {/* Badges List */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <FiAward className="text-amber-500" /> {isKz ? 'Оқушы марапаттары мен бейдждері' : 'Значки и награды за обучение'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(analytics?.achievements || []).map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl border p-5 transition-all flex items-start gap-4 ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-50/60 to-white border-amber-200/80 shadow-md shadow-amber-500/5'
                      : 'bg-slate-50/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                    badge.unlocked ? 'bg-amber-100 ring-2 ring-amber-400/40' : 'bg-slate-200 grayscale'
                  }`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-sm">{badge.title}</h4>
                      {badge.unlocked ? (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ {isKz ? 'Ашылды' : 'Открыто'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          {badge.progress}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Course-by-Course Watch Percentage Breakdown */}
          {analytics?.courses && analytics.courses.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-5">
                {isKz ? 'Әр пән бойынша бейнесабақтарды көру деңгейі' : 'Детальный процент просмотра по предметам'}
              </h3>
              <div className="space-y-6">
                {analytics.courses.map(crs => (
                  <div key={crs.course_id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <Link to={`/course/${crs.course_id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                        {crs.course_title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-slate-500">
                          {crs.completed_count}/{crs.total_lessons} {isKz ? 'сабақ өтілді' : 'уроков'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-bold">
                          {crs.progress_percent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${crs.progress_percent}%` }}
                      />
                    </div>

                    {/* Lesson pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {crs.lessons?.map((les, idx) => (
                        <Link
                          key={les.lesson_id}
                          to={`/lesson/${les.lesson_id}`}
                          title={`${les.title} — ${les.watch_percent}% қаралды`}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                            les.completed || les.watch_percent >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : les.watch_percent > 0
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {les.completed || les.watch_percent >= 80 ? (
                            <FiCheck size={12} className="text-emerald-600" />
                          ) : (
                            <FiVideo size={11} className="text-slate-400" />
                          )}
                          <span>№{idx + 1}: {les.watch_percent}%</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
