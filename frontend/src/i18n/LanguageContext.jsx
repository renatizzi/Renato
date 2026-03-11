import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from './translations';
import { translateCategory, isDefaultCategory } from './translations';
import apiClient from '../services/apiClient';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('boxmanager_language');
    return saved || 'it';
  });

  useEffect(() => {
    localStorage.setItem('boxmanager_language', language);
  }, [language]);

  const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

  // Auto-translate default categories when language changes
  const translateCategories = useCallback(async (newLang) => {
    try {
      const response = await apiClient.get(`${API}/categories`);
      const cats = response.data;

      for (const cat of cats) {
        if (isDefaultCategory(cat.name)) {
          const translated = translateCategory(cat.name, newLang);
          if (translated !== cat.name) {
            await apiClient.put(`${API}/categories/${cat.id}`, { name: translated, color: cat.color });
          }
        }
      }
    } catch (err) {
      // Silent fail - non-critical operation
    }
  }, [API]);

  const handleSetLanguage = useCallback((newLang) => {
    setLanguage(newLang);
    translateCategories(newLang);
  }, [translateCategories]);

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
    setLanguage: handleSetLanguage,
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
