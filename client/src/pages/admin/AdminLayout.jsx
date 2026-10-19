import { NavLink, Outlet } from 'react-router-dom';
import { FiBarChart2, FiBook, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const navItems = [
  { to: '/admin', icon: FiBarChart2, label: 'Дашборд', end: true },
  { to: '/admin/courses', icon: FiBook, label: 'Курсы' },
  { to: '/admin/users', icon: FiUsers, label: 'Пользователи' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
        <div className="p-5 flex items-center gap-3 border-b border-gray-800">
          <img src="/logo.png" alt="UBT140" className="w-9 h-9 object-contain bg-white rounded-xl p-0.5 shadow-sm" />
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">UBT140<span className="text-amber-400">.KZ</span></h2>
            <p className="text-[11px] text-gray-400">Басқару панелі</p>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={16} /> На сайт
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden w-full bg-gray-900 fixed bottom-0 left-0 z-50 border-t border-gray-800">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                  isActive ? 'text-primary-400' : 'text-gray-400'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
