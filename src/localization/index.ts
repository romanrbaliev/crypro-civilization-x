
import { ru } from './ru';
import { en } from './en';

// Доступные языки
export type SupportedLanguage = 'ru' | 'en';

// Словарь локализации
export const locales = {
  ru,
  en
};

// Текущий язык (пока всегда русский)
export const currentLanguage: SupportedLanguage = 'ru';

/**
 * Получить локализованный текст по ключу
 * @param key Ключ в формате 'category.subcategory.id'
 * @param params Параметры для подстановки {0}, {1}, ...
 * @returns Локализованный текст
 */
export const t = (key: string, params?: (string | number)[]): string => {
  // Разбиваем ключ на части
  const parts = key.split('.');
  
  // Получаем локаль
  const locale = locales[currentLanguage] || locales.ru;
  
  // Рекурсивно получаем значение из вложенных объектов
  let value: any = locale;
  for (const part of parts) {
    if (!value || typeof value !== 'object') {
      console.warn(`Локализация не найдена для ключа: ${key}`);
      return key;
    }
    value = value[part];
  }
  
  // Если значение не найдено, возвращаем ключ
  if (value === undefined || value === null) {
    console.warn(`Локализация не найдена для ключа: ${key}`);
    return key;
  }
  
  // Если это не строка, преобразуем в строку
  let result = String(value);
  
  // Подставляем параметры, если они есть
  if (params && params.length > 0) {
    params.forEach((param, index) => {
      result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), String(param));
    });
  }
  
  return result;
};

/**
 * Получить правильную форму слова в зависимости от числа (для русского языка)
 * @param count Число
 * @param forms Массив форм ['событие', 'события', 'событий']
 * @returns Правильная форма слова
 */
export const pluralize = (count: number, key: string): string => {
  const locale = locales[currentLanguage];
  let forms: string[];
  
  // Получаем формы из локализации
  if (locale.common?.countForms?.[key]) {
    forms = locale.common.countForms[key];
  } else {
    console.warn(`Формы множественного числа не найдены для ключа: ${key}`);
    return key;
  }
  
  // Для английского языка
  if (currentLanguage === 'en') {
    return count === 1 ? forms[0] : forms[1];
  }
  
  // Для русского языка используем правила склонения
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return forms[2];
  }
  
  if (lastDigit === 1) {
    return forms[0];
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }
  
  return forms[2];
};

/**
 * Получить строку в формате "число + форма слова"
 * @param count Число
 * @param key Ключ формы
 * @returns Отформатированная строка
 */
export const tCount = (count: number, key: string): string => {
  return `${count} ${pluralize(count, key)}`;
};
