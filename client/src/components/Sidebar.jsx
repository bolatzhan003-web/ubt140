import { Link } from 'react-router-dom';
import { FiCheck, FiPlay, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar({ course, sections, currentLessonId, progress = [] }) {
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

  const isCompleted = (lessonId) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Course title */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <Link to={`/course/${course.id}`} className="text-slate-900 font-bold text-xs hover:text-blue-600 line-clamp-2">
          {course.title}
        </Link>
      </div>

      {/* Sections */}
      <div className="divide-y divide-slate-100">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-bold text-slate-800">{section.title}</span>
              {expandedSections.includes(section.id) ? (
                <FiChevronUp className="text-slate-400 flex-shrink-0" size={14} />
              ) : (
                <FiChevronDown className="text-slate-400 flex-shrink-0" size={14} />
              )}
            </button>

            {expandedSections.includes(section.id) && section.lessons && (
              <div className="pb-1 bg-white">
                {section.lessons.map((lesson) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const completed = isCompleted(lesson.id);
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
                          <FiCheck className="text-emerald-500" size={13} />
                        ) : (
                          <FiPlay className="text-slate-300" size={11} />
                        )}
                      </span>
                      <span className="line-clamp-1">{lesson.title}</span>
                      {lesson.duration && (
                        <span className="ml-auto text-[10px] text-slate-400 flex-shrink-0 pl-2">{lesson.duration}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
