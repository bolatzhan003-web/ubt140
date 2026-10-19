import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiMenu, FiX, FiLogOut, FiBook, FiSettings } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="UBT140 Logo"
                className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-black tracking-tight text-[#0f2347] group-hover:text-blue-600 transition-colors">
                UBT140<span className="text-[#f59e0b]">.KZ</span>
              </span>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {t.nav.home}
              </Link>
              <Link to="/catalog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                {t.nav.catalog}
              </Link>
              {user && (
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  {t.nav.myCourses}
                </Link>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Clean RU / KZ Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => toggleLang('kz')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'kz'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                KZ
              </button>
              <button
                onClick={() => toggleLang('ru')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'ru'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                RU
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiBook className="text-blue-600" /> {t.nav.myCourses}
                      </Link>
                      {(user.role === 'admin' || user.role === 'instructor') && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiSettings className="text-blue-600" /> {t.nav.adminPanel}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <FiLogOut /> {t.nav.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-all text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => toggleLang('kz')}
                className={`px-2 py-0.5 rounded ${lang === 'kz' ? 'bg-white text-slate-900 font-bold' : 'text-slate-500'}`}
              >
                KZ
              </button>
              <button
                onClick={() => toggleLang('ru')}
                className={`px-2 py-0.5 rounded ${lang === 'ru' ? 'bg-white text-slate-900 font-bold' : 'text-slate-500'}`}
              >
                RU
              </button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-700 p-2">
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav list */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-800 py-1">
            {t.nav.home}
          </Link>
          <Link to="/catalog" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-800 py-1">
            {t.nav.catalog}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-slate-800 py-1">
                {t.nav.myCourses}
              </Link>
              {(user.role === 'admin' || user.role === 'instructor') && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-blue-600 py-1">
                  {t.nav.adminPanel}
                </Link>
              )}
              <button onClick={handleLogout} className="block text-left text-sm font-medium text-rose-600 py-1 w-full">
                {t.nav.logout}
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 text-xs font-bold border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50">
                {t.nav.login}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20">
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
