
import { gameIds } from '@/i18n';

/**
 * Безопасно получает ID из объекта gameIds
 * @param category Категория (features, resources, buildings, upgrades)
 * @param id Идентификатор элемента
 * @param defaultValue Значение по умолчанию
 * @returns Безопасный ID или значение по умолчанию
 */
export function getSafeGameId(category: string, id: string, defaultValue: string = id): string {
  try {
    if (!gameIds || typeof gameIds !== 'object') {
      return defaultValue;
    }
    
    const categoryObj = gameIds[category as keyof typeof gameIds];
    
    if (!categoryObj || typeof categoryObj !== 'object') {
      return defaultValue;
    }
    
    return (categoryObj as Record<string, string>)[id] || defaultValue;
  } catch (error) {
    console.error(`Ошибка при получении ID: ${category}.${id}`, error);
    return defaultValue;
  }
}

/**
 * Проверяет наличие ID в объекте gameIds
 * @param category Категория (features, resources, buildings, upgrades)
 * @param id Идентификатор элемента
 * @returns true если ID существует
 */
export function hasGameId(category: string, id: string): boolean {
  try {
    if (!gameIds || typeof gameIds !== 'object') {
      return false;
    }
    
    const categoryObj = gameIds[category as keyof typeof gameIds];
    
    if (!categoryObj || typeof categoryObj !== 'object') {
      return false;
    }
    
    return id in (categoryObj as Record<string, string>);
  } catch (error) {
    console.error(`Ошибка при проверке наличия ID: ${category}.${id}`, error);
    return false;
  }
}

/**
 * Создает мапу ID с их безопасными значениями
 * @param category Категория (features, resources, buildings, upgrades)
 * @param ids Массив идентификаторов
 * @returns Объект с безопасными ID
 */
export function getSafeGameIds(category: string, ids: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  ids.forEach(id => {
    result[id] = getSafeGameId(category, id, id);
  });
  
  return result;
}
