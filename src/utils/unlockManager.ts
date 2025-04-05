/**
 * ЭТОТ ФАЙЛ СОХРАНЕН ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
 * ВСЯ ЛОГИКА ТЕПЕРЬ НАХОДИТСЯ В unifiedUnlockSystem.ts
 */

import { GameState } from '@/context/types';
import { 
  checkAllUnlocks as checkAllUnlocksUnified,
  forceCheckAllUnlocks as forceCheckAllUnlocksUnified,
  isUnlocked as isUnlockedUnified
} from './unifiedUnlockSystem';

console.log('Внимание: устаревший файл unlockManager.ts загружен. Используйте unifiedUnlockSystem.ts');

/**
 * Проверяет все возможные разблокировки в игре
 * ВАЖНО: Не блокирует повторно то, что уже было разблокировано
 */
export function checkAllUnlocks(state: GameState): GameState {
  console.log('Устаревший unlockManager: Запуск проверки всех разблокировок (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
}

/**
 * Проверяет специальные разблокировки, такие как разблокировка вкладок интерфейса, пороговые значения и т.д.
 * ВАЖНО: Не блокирует повторно то, что уже было разблокировано
 */
export function checkSpecialUnlocks(state: GameState): GameState {
  console.log('Устаревший unlockManager: Проверка специальных разблокировок (перенаправлено в unifiedUnlockSystem)');
  return checkAllUnlocksUnified(state);
}

/**
 * Полная перестройка всех разблокировок с нуля на основе состояния
 * СОХРАНЯЕТ ранее разблокированные элементы
 */
export function rebuildAllUnlocks(state: GameState): GameState {
  console.log('Устаревший unlockManager: Полная перестройка всех разблокировок (перенаправлено в unifiedUnlockSystem)');
  return forceCheckAllUnlocksUnified(state);
}

// Другие функции с перенаправлением на unifiedUnlockSystem...

/**
 * Безопасно получает значение счетчика
 */
function getCounterValue(state: GameState, counterId: string): number {
  const counter = state.counters[counterId];
  if (!counter) return 0;
  return typeof counter === 'object' ? counter.value : counter;
}
