
import { GameState } from '@/context/types';

/**
 * Проверяет соответствие требованиям для разблокировки или покупки элемента
 */
export function checkRequirements(
  state: GameState, 
  requirements: Record<string, any>
): boolean {
  if (!requirements || Object.keys(requirements).length === 0) {
    return true; // Если нет требований, они считаются выполненными
  }

  for (const [key, value] of Object.entries(requirements)) {
    // Проверка на количество ресурса
    if (state.resources[key] && typeof value === 'number') {
      if (state.resources[key].value < value) {
        return false;
      }
    }
    
    // Проверка на количество зданий
    else if (state.buildings[key] && typeof value === 'number') {
      if (state.buildings[key].count < value) {
        return false;
      }
    }
    
    // Проверка на исследования
    else if (state.upgrades[key] && typeof value === 'boolean') {
      if (state.upgrades[key].purchased !== value) {
        return false;
      }
    }
    
    // Проверка на счетчики
    else if (state.counters[key] && typeof value === 'number') {
      const counterValue = typeof state.counters[key] === 'object' 
                          ? state.counters[key].value 
                          : state.counters[key];
      if (counterValue < value) {
        return false;
      }
    }
    
    // Проверка на разблокировки
    else if (key.startsWith('unlocked.') && typeof value === 'boolean') {
      const unlockKey = key.replace('unlocked.', '');
      if (!state.unlocks || state.unlocks[unlockKey] !== value) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Получает список невыполненных требований
 */
export function getMissingRequirements(
  state: GameState, 
  requirements: Record<string, any>
): string[] {
  const missing: string[] = [];

  if (!requirements || Object.keys(requirements).length === 0) {
    return missing;
  }

  for (const [key, value] of Object.entries(requirements)) {
    // Проверка на количество ресурса
    if (state.resources[key] && typeof value === 'number') {
      if (state.resources[key].value < value) {
        missing.push(`${state.resources[key].name}: ${state.resources[key].value}/${value}`);
      }
    }
    
    // Проверка на количество зданий
    else if (state.buildings[key] && typeof value === 'number') {
      if (state.buildings[key].count < value) {
        missing.push(`${state.buildings[key].name}: ${state.buildings[key].count}/${value}`);
      }
    }
    
    // Проверка на исследования
    else if (state.upgrades[key] && typeof value === 'boolean') {
      if (state.upgrades[key].purchased !== value) {
        missing.push(`Исследование: ${state.upgrades[key].name}`);
      }
    }
  }

  return missing;
}
