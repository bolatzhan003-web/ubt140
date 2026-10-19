import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  const { lang } = useLang();

  const isKz = lang === 'kz';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16 bg-[#f8fafc]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm">
          <FiAlertCircle size={40} />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          404 Error
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          {isKz ? 'Бет табылмады' : 'Страница не найдена'}
        </h1>

        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          {isKz
            ? 'Сіз іздеген бет жойылған, атауы өзгертілген немесе уақытша қолжетімсіз болуы мүмкін.'
            : 'Запрошенная страница не существует или была перемещена по другому адресу.'}
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            <FiHome size={18} />
            {isKz ? 'Басты бетке оралу' : 'Вернуться на главную'}
          </Link>
        </div>
      </div>
    </div>
  );
}
