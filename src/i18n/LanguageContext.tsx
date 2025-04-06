
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { Language, TranslationsType } from './types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
    
    // Принудительное обновление UI после смены языка
    setTimeout(() => {
      window.dispatchEvent(new Event('language-changed'));
    }, 0);
  };
  
  // Функция перевода с поддержкой параметров
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) return '';
    
    try {
      const currentTranslations = translations[language] as TranslationsType;
      let translatedText = currentTranslations[key] || key;
      
      // Проверяем, был ли выполнен перевод или вернулся оригинальный ключ
      if (translatedText === key && language === 'en' && translations['ru'][key]) {
        // Если у нас есть русский перевод, но нет английского, используем ключ
        translatedText = key;
      }
      
      // Замена параметров в переводе, если они есть
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translatedText = translatedText.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      
      return translatedText;
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
