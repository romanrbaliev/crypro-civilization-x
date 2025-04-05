
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, TranslationKey } from './types';
import { translations } from './translations';

// Установка языка по умолчанию
const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';

// Создание интерфейса для контекста
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
}

// Создание контекста с начальными значениями
const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: () => '',
});

// Хук для доступа к контексту языка
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Функция для сохранения выбранного языка в localStorage
const saveLanguagePreference = (language: SupportedLanguage): void => {
  try {
    localStorage.setItem('preferredLanguage', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Функция для загрузки выбранного языка из localStorage
const loadLanguagePreference = (): SupportedLanguage => {
  try {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage as SupportedLanguage) || DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error loading language preference:', error);
    return DEFAULT_LANGUAGE;
  }
};

// Провайдер для контекста языка
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  
  // Загружаем сохраненный язык при инициализации
  useEffect(() => {
    const savedLanguage = loadLanguagePreference();
    setLanguageState(savedLanguage);
  }, []);
  
  // Функция для изменения языка
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  };
  
  // Функция для получения перевода по ключу
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
