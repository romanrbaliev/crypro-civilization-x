
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { Language, TranslationsType } from './types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'ru';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  
  // Проверяем localStorage при первом рендере
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ru' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Сохраняем выбранный язык
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  // Функция перевода
  const t = (key: string): string => {
    if (!key) return '';
    
    try {
      const currentTranslations = translations[language] as TranslationsType;
      return currentTranslations[key] || key;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };
  
  const contextValue = {
    language,
    setLanguage: handleSetLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
