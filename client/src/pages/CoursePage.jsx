import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiClock, FiBook, FiUsers, FiPlay, FiChevronDown, FiChevronUp, FiLock } from 'react-icons/fi';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data.course);
        setSections(res.data.sections);
        setEnrolled(res.data.enrolled);
        setExpandedSections(res.data.sections.map(s => s.id));
      })
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      toast.success('Вы успешно записались на курс');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(sId => sId !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isAdminOrInstructor = user && (user.role === 'admin' || user.role === 'instructor');
  const availableSection = isAdminOrInstructor 
    ? sections.find(s => s.lessons?.length > 0)
    : sections.find(s => !s.is_locked && s.lessons?.length > 0);
  const firstLessonId = availableSection?.lessons?.[0]?.id || sections[0]?.lessons?.[0]?.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="animate-fade-in bg-[#f8fafc] text-slate-900 min-h-screen">
      {/* Course Banner */}
      <div className="border-b border-slate-200 bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              {course.category && (
                <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-md mb-4">
                  {course.category}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 mb-8">
                {course.duration && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <FiClock className="text-blue-600" /> {course.duration}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <FiPlay className="text-blue-600" /> {course.lesson_count || 0} {t.course.lessons}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <FiUsers className="text-blue-600" /> {course.student_count || 0} {t.catalog.studentsCount}
                </span>
              </div>

              {course.instructor_name && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {course.instructor_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">{t.course.instructor}</p>
                    <p className="font-semibold text-slate-800 text-xs">{course.instructor_name}</p>
                  </div>
                </div>
              )}

              {enrolled ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Link
                    to={firstLessonId ? `/lesson/${firstLessonId}` : '#'}
                    className="inline-flex items-center px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
                  >
                    <FiPlay className="mr-2" size={14} /> {t.course.enrolledBtn}
                  </Link>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                    ✓ Доступ открыт
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 max-w-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      🔒 {t.course.enrollBtn}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {t.course.lockedNotice}
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div className="lg:w-96 w-full flex-shrink-0">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                alt={course.title}
                className="w-full aspect-video object-cover rounded-2xl border border-slate-200 shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Program */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {t.course.program}
        </h2>

        <div className="space-y-3">
          {sections.map((section, idx) => {
            const isLocked = Boolean(section.is_locked);
            const isRestrictedForUser = isLocked && !isAdminOrInstructor;

            return (
              <div 
                key={section.id} 
                className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
                  isLocked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                    isLocked 
                      ? 'bg-slate-100/90 hover:bg-slate-200/50 border-l-4 border-slate-400' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isLocked ? 'bg-slate-300 text-slate-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {isLocked ? <FiLock size={12} /> : idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold text-sm ${isLocked ? 'text-slate-600' : 'text-slate-900'}`}>
                          {section.title}
                        </h3>
                        {isLocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">
                            <FiLock size={10} /> Жабық бөлім
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <span>{section.lessons?.length || 0} {t.course.lessons}</span>
                    {expandedSections.includes(section.id) ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>

                {expandedSections.includes(section.id) && section.lessons && (
                  <div className={`border-t border-slate-100 divide-y divide-slate-100 ${
                    isLocked ? 'bg-slate-100/40' : 'bg-slate-50/50'
                  }`}>
                    {section.lessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center justify-between px-6 py-3 pl-14">
                        <div className="flex items-center gap-2.5">
                          {isRestrictedForUser ? (
                            <FiLock className="text-slate-400" size={12} />
                          ) : (
                            <FiPlay className="text-blue-600" size={12} />
                          )}
                          <span className={`text-xs font-medium ${isRestrictedForUser ? 'text-slate-400' : 'text-slate-700'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {lesson.duration && (
                            <span className="text-[11px] text-slate-400">{lesson.duration}</span>
                          )}
                          {isRestrictedForUser ? (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/70 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <FiLock size={10} /> Әзірге жабық
                            </span>
                          ) : (
                            enrolled && (
                              <Link
                                to={`/lesson/${lesson.id}`}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                {t.course.watch} →
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
