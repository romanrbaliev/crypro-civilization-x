
import { useCallback } from 'react';
import { 
  SupportedLocale, 
  TranslationValue, 
  useTranslation, 
  localeNames 
} from '@/i18n';

/**
 * Хук для работы с локализацией
 */
export const useI18n = () => {
  // Функция перевода строки
  const translate = useCallback((key: string): string => {
    return useTranslation(key);
  }, []);

  // Функция форматирования значения с учетом локали
  const formatValue = useCallback(
    (value: TranslationValue, format: string = 'default'): string => {
      if (typeof value === 'number') {
        switch (format) {
          case 'currency':
            return value.toFixed(2);
          case 'percentage':
            return `${(value * 100).toFixed(1)}%`;
          case 'decimal':
            return value.toFixed(1);
          case 'integer':
            return Math.floor(value).toString();
          default:
            return value.toString();
        }
      }
      
      return value;
    },
    []
  );

  // Получение списка доступных локалей
  const getAvailableLocales = useCallback((): SupportedLocale[] => {
    return Object.keys(localeNames) as SupportedLocale[];
  }, []);

  // Возвращаем функции для использования в компонентах
  return {
    t: translate,
    formatValue,
    getAvailableLocales,
    localeNames
  };
};
