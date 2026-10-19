import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiUser, FiPhone, FiLock, FiArrowRight } from 'react-icons/fi';
import { formatKazakhstanPhone, cleanPhoneDigits } from '../utils/phone';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const isKz = lang === 'kz';

  const handlePhoneChange = (e) => {
    setPhone(formatKazakhstanPhone(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isKz ? 'Аты-жөніңізді енгізіңіз' : 'Введите ваше имя');
      return;
    }

    const digits = cleanPhoneDigits(phone);
    if (digits.length < 11) {
      toast.error(isKz ? 'Телефон нөмірін толық енгізіңіз (+7 7XX XXX-XX-XX)' : 'Введите полный номер телефона (+7 7XX XXX-XX-XX)');
      return;
    }

    if (password.length < 6) {
      toast.error(isKz ? 'Құпиясөз кемінде 6 символдан тұруы керек' : 'Пароль должен быть не менее 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(isKz ? 'Құпиясөздер сәйкес келмейді' : 'Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), phone, password);
      toast.success(isKz ? 'Тіркелу сәтті аяқталды!' : 'Регистрация успешна!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || (isKz ? 'Тіркелу қатесі' : 'Ошибка регистрации'));
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
            {isKz ? 'Платформаға тіркелу' : 'Регистрация в UBT140'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {isKz ? 'ҰБТ-ға дайындықты бүгіннен бастаңыз' : 'Создайте аккаунт и начните подготовку к ЕНТ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-7 sm:p-8">
          {/* Full name */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isKz ? 'Аты-жөніңіз (Оқушы)' : 'Ваше имя и фамилия'}
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder={isKz ? 'Аружан Қанатқызы' : 'Аружан Канаткызы'}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Kazakhstan Phone with Mask */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isKz ? 'Телефон нөмірі (WhatsApp)' : 'Номер телефона (WhatsApp)'}
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                required
                placeholder="+7 (7XX) XXX-XX-XX"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isKz ? 'Нөмір курсқа қолжетімділік беру үшін қажет' : 'Номер необходим для открытия доступа к курсам'}
            </p>
          </div>

          {/* Password */}
          <div className="mb-4">
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
                placeholder={isKz ? 'Кемінде 6 символ' : 'Минимум 6 символов'}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {isKz ? 'Құпиясөзді қайталаңыз' : 'Повторите пароль'}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? (isKz ? 'Тіркелу...' : 'Регистрация...') : (isKz ? 'Тіркелу және бастау' : 'Создать аккаунт')}
            <FiArrowRight size={16} />
          </button>

          <div className="mt-6 text-center text-xs text-slate-500">
            {isKz ? 'Аккаунтыңыз бар ма?' : 'Уже есть аккаунт?'}{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              {isKz ? 'Кіру' : 'Войти'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
