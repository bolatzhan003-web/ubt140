import { Link } from 'react-router-dom';
import { FiClock, FiBook, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';

export default function CourseCard({ course }) {
  const { t } = useLang();

  return (
    <Link
      to={`/course/${course.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 overflow-hidden"
    >
      {/* High-res Clean Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {course.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/50">
            {course.category}
          </span>
        )}

        {course.duration && (
          <span className="absolute bottom-2.5 right-3 px-2 py-0.5 text-[11px] font-medium text-white bg-black/60 backdrop-blur-md rounded">
            {course.duration}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        </div>

        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="truncate max-w-[150px] font-medium text-slate-700">
              {course.instructor_name || 'Преподаватель'}
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <FiBook size={12} className="text-blue-600" /> {course.lesson_count || 0} {t.catalog.lessonsCount}
            </span>
          </div>

          {/* Progress bar if student is enrolled */}
          {course.completed_count !== undefined && course.lesson_count > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Прогресс</span>
                <span className="text-blue-600">{Math.round((course.completed_count / course.lesson_count) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(course.completed_count / course.lesson_count) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
