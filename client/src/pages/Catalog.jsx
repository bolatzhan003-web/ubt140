import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLang } from '../context/LanguageContext';
import { SUBJECTS_LIST } from '../translations';

export default function Catalog() {
  const { t, lang } = useLang();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';
  const isKz = lang === 'kz';

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

      {/* Controls: Search Input + Dropdown Subject Select */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t.catalog.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Dropdown Select for Subjects */}
        <div className="relative sm:w-80 flex-shrink-0">
          <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" size={16} />
          <select
            value={selectedCategory}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer appearance-none hover:border-slate-300 transition-colors"
          >
            <option value="">
              {isKz ? 'Барлық пәндер (Барлығы)' : 'Все предметы (Все курсы)'}
            </option>
            {SUBJECTS_LIST.map(sub => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Active Filter Pill */}
      {selectedCategory && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-500 font-medium">
            {isKz ? 'Таңдалған пән:' : 'Выбранный предмет:'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
            {selectedCategory}
            <button
              onClick={() => setCategoryFilter('')}
              className="text-blue-500 hover:text-blue-900 ml-1 text-sm font-bold"
              title="Тазарту"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{t.catalog.notFound}</h3>
          <p className="text-slate-500 text-xs mb-4">{t.catalog.trySearchAgain}</p>
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            {isKz ? 'Сүзгілерді тазарту' : 'Сбросить фильтры'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
