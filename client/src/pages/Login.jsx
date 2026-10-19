import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiPhone, FiLock, FiArrowRight } from 'react-icons/fi';
import { formatKazakhstanPhone } from '../utils/phone';
import toast from 'react-hot-toast';

export default function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const isKz = lang === 'kz';

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // If user enters letters/email (e.g. admin@lms.com), keep as is
    if (/[a-zA-Z@]/.test(val)) {
      setLoginInput(val);
    } else {
      // Otherwise apply KZ phone mask +7 (7XX) XXX-XX-XX
      setLoginInput(formatKazakhstanPhone(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.trim() || !password) {
      toast.error(isKz ? 'Барлық өрістерді толтырыңыз' : 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await login(loginInput.trim(), password);
      toast.success(isKz ? 'Қош келдіңіз!' : 'Добро пожаловать!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || (isKz ? 'Кіру қатесі' : 'Ошибка входа'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-[#f8fafc] animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="UBT140 Logo"
            className="w-20 h-20 object-contain mx-auto mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isKz ? 'Платформаға кіру' : 'Вход в аккаунт'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {isKz ? 'ҰБТ дайындығын жалғастыру үшін жүйеге кіріңіз' : 'Войдите, чтобы продолжить подготовку к ЕНТ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-7 sm:p-8">
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isKz ? 'Телефон нөмірі немесе Email' : 'Номер телефона или Email'}
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={loginInput}
                onChange={handlePhoneChange}
                required
                placeholder="+7 (7XX) XXX-XX-XX"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 font-medium placeholder-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isKz ? 'Қазақстандық нөмірді енгізіңіз (маска автоқойылады)' : 'Введите казахстанский номер (маска ставится авто)'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isKz ? 'Құпиясөз' : 'Пароль'}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (isKz ? 'Кіру...' : 'Вход...') : (isKz ? 'Жүйеге кіру' : 'Войти в аккаунт')}
            <FiArrowRight size={16} />
          </button>

          <div className="mt-6 text-center text-xs text-slate-500">
            {isKz ? 'Аккаунтыңыз жоқ па?' : 'Нет аккаунта?'}{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              {isKz ? 'Тіркелу' : 'Зарегистрироваться'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
