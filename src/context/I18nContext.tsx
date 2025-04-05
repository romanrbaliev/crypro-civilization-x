
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from './translations';

// Поддерживаемые локали
export type SupportedLocale = 'ru' | 'en';

// Типы для перевода значений
export type TranslationValue = string | number;

// Интерфейс контекста i18n
export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
  formatValue: (value: TranslationValue, format?: string) => string;
  getAvailableLocales: () => SupportedLocale[];
  localeNames: Record<SupportedLocale, string>;
}

// Названия локалей
const localeNames: Record<SupportedLocale, string> = {
  ru: 'Русский',
  en: 'English'
};

// Создаем контекст
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Провайдер контекста
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<SupportedLocale>('ru');

  // Функция перевода
  const t = (key: string): string => {
    // Ищем перевод для текущей локали
    const translation = translations[locale][key];
    
    // Если перевод не найден, возвращаем ключ
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return translation;
  };

  // Форматирование значений в соответствии с локалью
  const formatValue = (value: TranslationValue, format?: string): string => {
    if (typeof value === 'number') {
      if (format === 'percent') {
        return `${value.toFixed(0)}%`;
      }
      
      // Форматируем числа в соответствии с локалью
      if (value >= 1000 || value <= -1000) {
        return value.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US');
      }
      
      if (value < 0.01 && value > 0) {
        return value.toExponential(2);
      }
      
      return value.toFixed(2);
    }
    
    return String(value);
  };

  // Получение списка доступных локалей
  const getAvailableLocales = (): SupportedLocale[] => {
    return Object.keys(translations) as SupportedLocale[];
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    t,
    formatValue,
    getAvailableLocales,
    localeNames
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Хук для использования i18n
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
