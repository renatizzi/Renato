import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language or default to Italian
    const saved = localStorage.getItem('boxmanager_language');
    return saved || 'it';
  });

  useEffect(() => {
    localStorage.setItem('boxmanager_language', language);
  }, [language]);

  // Get translation
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to Italian
        value = translations['it'];
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }
    return value || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    isItalian: language === 'it',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
