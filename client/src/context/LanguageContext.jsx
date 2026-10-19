import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ubt_lang') || 'kz';
  });

  useEffect(() => {
    localStorage.setItem('ubt_lang', lang);
  }, [lang]);

  const toggleLang = (newLang) => {
    if (newLang) setLang(newLang);
    else setLang(prev => (prev === 'kz' ? 'ru' : 'kz'));
  };

  const t = translations[lang] || translations.kz;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
}
