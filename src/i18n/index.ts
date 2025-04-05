
// Импортируем типы из types.ts
import { 
  SupportedLocale, 
  TranslationValue, 
  localeNames, 
  normalizeId, 
  getTranslation,
  gameIds 
} from './types';

// Базовый экспорт для i18n
export const useTranslation = (key: string): string => {
  return key;
};

// Экспортируем все типы и утилиты
export { normalizeId, getTranslation };
export { gameIds };
export type { SupportedLocale, TranslationValue };
export { localeNames };
