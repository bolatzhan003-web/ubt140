import { Link } from 'react-router-dom';
import { FiCheck, FiPlay, FiChevronDown, FiChevronUp, FiLock } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ course, sections = [], currentLessonId, progress = [] }) {
  const { user } = useAuth();
  const isAdminOrInstructor = user && (user.role === 'admin' || user.role === 'instructor');

  const [expandedSections, setExpandedSections] = useState(
    sections.map(s => s.id)
  );

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getLessonProgress = (lessonId) => {
    return progress.find(p => p.lesson_id === lessonId);
  };

  const isCompleted = (lessonId) => {
    const p = getLessonProgress(lessonId);
    return Boolean(p && (p.completed || (p.watch_percent && p.watch_percent >= 80)));
  };

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const completedLessons = sections.reduce((acc, s) => 
    acc + (s.lessons?.filter(l => isCompleted(l.id))?.length || 0), 0
  );
  const coursePercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Course title & overall progress */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2.5">
        <Link to={`/course/${course.id}`} className="text-slate-900 font-bold text-xs hover:text-blue-600 line-clamp-2">
          {course.title}
        </Link>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Курс барысы</span>
            <span className={coursePercent === 100 ? 'text-emerald-600' : 'text-blue-600'}>
              {completedLessons}/{totalLessons} ({coursePercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                coursePercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${coursePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-slate-100">
        {sections.map((section) => {
          const isLocked = Boolean(section.is_locked);
          const isRestrictedForUser = isLocked && !isAdminOrInstructor;

          return (
            <div key={section.id} className={isLocked ? 'bg-slate-50/80' : ''}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                  isLocked 
                    ? 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/60 border-l-4 border-slate-400' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {isLocked && <FiLock className="text-slate-500 flex-shrink-0" size={13} />}
                  <span className={`text-xs font-bold truncate ${isLocked ? 'text-slate-600' : 'text-slate-800'}`}>
                    {section.title}
                  </span>
                  {isLocked && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                      Жабық
                    </span>
                  )}
                </div>
                {expandedSections.includes(section.id) ? (
                  <FiChevronUp className="text-slate-400 flex-shrink-0" size={14} />
                ) : (
                  <FiChevronDown className="text-slate-400 flex-shrink-0" size={14} />
                )}
              </button>

              {expandedSections.includes(section.id) && section.lessons && (
                <div className={`pb-1 ${isLocked ? 'bg-slate-50' : 'bg-white'}`}>
                  {section.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const completed = isCompleted(lesson.id);
                    const prog = getLessonProgress(lesson.id);
                    const watchPct = prog?.watch_percent || 0;

                    if (isRestrictedForUser) {
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center px-4 py-2.5 text-xs text-slate-400 bg-slate-50/80 cursor-not-allowed select-none opacity-70"
                          title="Бұл аптаның / бөлімнің сабақтары әлі жабық"
                        >
                          <span className="flex-shrink-0 mr-2.5 text-slate-400">
                            <FiLock size={12} />
                          </span>
                          <span className="line-clamp-1 text-slate-400">{lesson.title}</span>
                          <div className="ml-auto pl-2 flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-400 font-semibold">Құлыпталған</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={lesson.id}
                        to={`/lesson/${lesson.id}`}
                        className={`flex items-center px-4 py-2.5 text-xs transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 text-blue-600 font-semibold border-l-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex-shrink-0 mr-2.5">
                          {completed ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <FiCheck size={11} strokeWidth={3} />
                            </div>
                          ) : watchPct > 0 ? (
                            <div className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center">
                              {watchPct}%
                            </div>
                          ) : (
                            <FiPlay className="text-slate-300" size={12} />
                          )}
                        </span>
                        <span className="line-clamp-1">{lesson.title}</span>
                        
                        <div className="ml-auto pl-2 flex items-center gap-1.5 flex-shrink-0">
                          {watchPct > 0 && !completed && (
                            <span className="text-[10px] text-sky-600 font-semibold">{watchPct}%</span>
                          )}
                          {lesson.duration && (
                            <span className="text-[10px] text-slate-400">{lesson.duration}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
