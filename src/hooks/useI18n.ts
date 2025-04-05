
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SupportedLocale, 
  TranslationValue, 
  getTranslation, 
  localeNames
} from '@/i18n';

// Сохранение выбранного языка
const saveLocale = (locale: SupportedLocale): void => {
  try {
    localStorage.setItem('user-locale', locale);
  } catch (e) {
    console.error('Failed to save locale to localStorage', e);
  }
};

// Загрузка сохраненного языка
const loadSavedLocale = (): SupportedLocale => {
  try {
    const savedLocale = localStorage.getItem('user-locale');
    return (savedLocale as SupportedLocale) || getDefaultLocale();
  } catch (e) {
    console.error('Failed to load locale from localStorage', e);
    return getDefaultLocale();
  }
};

// Определение языка по умолчанию из настроек браузера
const getDefaultLocale = (): SupportedLocale => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ru' ? 'ru' : 'en';
};

// Главный хук для интернационализации
export const useI18n = () => {
  // Инициализируем состояние текущей локали
  const [locale, setLocaleState] = useState<SupportedLocale>('ru'); // По умолчанию русский
  
  // Загружаем сохраненную локаль при монтировании
  useEffect(() => {
    const savedLocale = loadSavedLocale();
    setLocaleState(savedLocale);
  }, []);
  
  // Функция для изменения локали
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  }, []);
  
  // Функция для получения перевода по ключу
  const t = useCallback((key: string, params?: Record<string, string>): TranslationValue => {
    return getTranslation(locale, key, params);
  }, [locale]);
  
  // Возвращаем все необходимые значения и функции
  return useMemo(() => ({
    locale,         // Текущая локаль
    setLocale,      // Функция для изменения локали
    t,              // Функция для получения перевода
    localeNames     // Имена локалей для отображения в UI
  }), [locale, setLocale, t]);
};

// Экспорт хука для использования в компонентах
export default useI18n;
