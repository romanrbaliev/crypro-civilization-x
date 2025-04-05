
/**
 * DEPRECATED: ЭТОТ ФАЙЛ УСТАРЕЛ И СОХРАНЕН ТОЛЬКО ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ИСПОЛЬЗУЙТЕ unifiedUnlockSystem.ts ВМЕСТО НЕГО!
 */

console.warn('Внимание: устаревший файл unlockSystem.js загружен. Используйте unifiedUnlockSystem.ts');

import { initialState } from '@/context/initialState';

/**
 * Проверяет условия и обновляет состояние разблокировок
 */
export const checkAllUnlocks = (state) => {
  console.warn('Устаревший unlockSystem.js: checkAllUnlocks вызван. Используйте unifiedUnlockSystem.ts');
  
  // Ничего не делаем, просто возвращаем состояние без изменений
  // Для фактической функциональности используйте unifiedUnlockSystem.ts
  return state;
};

/**
 * Проверяет специальные условия разблокировок, которые требуют
 * глубокого анализа игрового состояния
 */
export const checkSpecialUnlocks = (state) => {
  console.warn('Устаревший unlockSystem.js: checkSpecialUnlocks вызван. Используйте unifiedUnlockSystem.ts');
  
  // Ничего не делаем, просто возвращаем состояние без изменений
  // Для фактической функциональности используйте unifiedUnlockSystem.ts
  return state;
};

/**
 * Принудительно проверяет все продвинутые разблокировки
 */
export const forceCheckAdvancedUnlocks = (state) => {
  console.warn('Устаревший unlockSystem.js: forceCheckAdvancedUnlocks вызван. Используйте unifiedUnlockSystem.ts');
  
  // Ничего не делаем, просто возвращаем состояние без изменений
  // Для фактической функциональности используйте unifiedUnlockSystem.ts
  return state;
};
