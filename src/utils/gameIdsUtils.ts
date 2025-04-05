
import { gameIds } from '@/i18n/types';

/**
 * Получает безопасный ID игрового элемента
 * @param type Тип элемента (resources, buildings, upgrades, features)
 * @param id ID элемента
 * @param fallback Значение по умолчанию, если ID не найден
 * @returns Безопасный ID элемента
 */
export const getSafeGameId = (
  type: 'resources' | 'buildings' | 'upgrades' | 'features',
  id: string,
  fallback?: string
): string => {
  // @ts-ignore - используем динамический доступ
  const category = gameIds[type];
  
  if (!category) {
    return fallback || id;
  }
  
  // @ts-ignore - используем динамический доступ
  const safeId = category[id];
  
  return safeId || fallback || id;
};
