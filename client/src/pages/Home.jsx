import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiPlay, FiFileText, FiAward, FiTrendingUp } from 'react-icons/fi';
import api from '../api/client';
import CourseCard from '../components/CourseCard';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useLang();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.courses.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjects = [
    { name: 'Математикалық сауаттылық', badge: '15 балл', icon: '01' },
    { name: 'Қазақстан тарихы', badge: '20 балл', icon: '02' },
    { name: 'Оқу сауаттылығы', badge: '15 балл', icon: '03' },
    { name: 'Математика', badge: '50 балл', icon: '04' },
    { name: 'Физика', badge: '50 балл', icon: '05' },
    { name: 'Химия', badge: '50 балл', icon: '06' },
    { name: 'Биология', badge: '50 балл', icon: '07' },
    { name: 'Ағылшын тілі', badge: '50 балл', icon: '08' },
  ];

  return (
    <div className="animate-fade-in bg-[#f8fafc] text-slate-900">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-white overflow-hidden">
        {/* Subtle background gradient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                {t.hero.badge}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                {t.hero.titlePart1}{' '}
                <span className="text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-4">
                  {t.hero.titleScore}
                </span>{' '}
                {t.hero.titlePart2}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed mx-auto lg:mx-0 font-normal">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={user ? "/catalog" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
                >
                  {t.hero.startBtn} <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-xl transition-all text-sm shadow-sm"
                >
                  {t.hero.freeTrial}
                </Link>
              </div>

              {/* Stats Highlights under Hero */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-12 max-w-md mx-auto lg:mx-0 pt-8 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{t.hero.statVal1}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.hero.statLabel1}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 tracking-tight">{t.hero.statVal2}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.hero.statLabel2}</p>
                </div>
              </div>
            </div>

            {/* Right: Real Student Photo + Clean Live Course Widget */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80"
                  alt="Student studying for ENT"
                  className="w-full h-[430px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                {/* Floating Widget 1: Online status */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-800">140.KZ Online</span>
                </div>

                {/* Floating Widget 2: Student Achievement card */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xl border border-slate-200/90 p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {t.hero.widgetCardTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      ЕНТ Базасы
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    {t.hero.widgetSub}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>{t.hero.widgetStudentName}</span>
                    <span className="text-slate-800 font-bold">{t.hero.widgetStudentResult}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.home.popularSubjects}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {t.home.popularDesc}
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
          >
            {t.home.allCourses} <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Grid of Subjects */}
      <section className="bg-white py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.home.subjectsHeading}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {t.home.subjectsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((sub, i) => (
              <Link
                key={i}
                to={`/catalog?category=${encodeURIComponent(sub.name)}`}
                className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">
                    {sub.icon}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600">
                    {sub.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {sub.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why UBT140 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.home.whyUs}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t.home.why1Title, desc: t.home.why1Desc, icon: FiPlay },
            { title: t.home.why2Title, desc: t.home.why2Desc, icon: FiFileText },
            { title: t.home.why3Title, desc: t.home.why3Desc, icon: FiAward },
            { title: t.home.why4Title, desc: t.home.why4Desc, icon: FiTrendingUp },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <item.icon size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-blue-600 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-600/10">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              {t.home.ctaTitle}
            </h2>
            <p className="text-sm text-blue-100">
              {t.home.ctaDesc}
            </p>
          </div>
          <Link
            to={user ? "/catalog" : "/register"}
            className="px-8 py-3.5 bg-white hover:bg-slate-50 text-blue-600 text-sm font-semibold rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            {t.home.ctaBtn}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">UBT140.KZ</span>
            <span>—</span>
            <span>Онлайн-платформа подготовки к ЕНТ</span>
          </div>
          <p>© 2025-2026 UBT140.KZ. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
