
import { ru } from './ru';
import { en } from './en';
import { TranslationsType, SupportedLanguage } from '../types';

// Объект со всеми доступными переводами
export const translations: Record<SupportedLanguage, TranslationsType> = {
  ru,
  en
};

export { ru, en };
