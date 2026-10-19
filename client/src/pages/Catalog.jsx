import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLang } from '../context/LanguageContext';
import { SUBJECTS_LIST } from '../translations';

export default function Catalog() {
  const { t } = useLang();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (search) params.set('search', search);

    api.get(`/courses?${params.toString()}`)
      .then(res => setCourses(res.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const setCategoryFilter = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in bg-[#f8fafc] text-slate-900 min-h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t.catalog.title}
        </h1>
        <p className="text-slate-500 text-sm">
          {t.catalog.subtitle}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t.catalog.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400 shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Subjects Filter */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FiFilter className="text-blue-600" /> {t.catalog.filterSubject}
            </h3>

            <div className="space-y-1">
              <button
                onClick={() => setCategoryFilter('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.catalog.allSubjects}
              </button>

              {SUBJECTS_LIST.map(sub => (
                <button
                  key={sub}
                  onClick={() => setCategoryFilter(sub)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === sub
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">{t.catalog.notFound}</h3>
              <p className="text-slate-500 text-xs">{t.catalog.trySearchAgain}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">
                  {t.catalog.foundCourses} <span className="text-slate-900 font-semibold">{courses.length}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
