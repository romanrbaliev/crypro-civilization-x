
import { GameState } from '@/context/types';

/**
 * Сервис для управления разблокировками элементов в игре
 */
export class UnlockService {
  
  /**
   * Принудительно разблокирует элемент
   * @param state Текущее состояние игры
   * @param itemId Идентификатор элемента для разблокировки
   * @returns Обновленное состояние игры
   */
  forceUnlock(state: GameState, itemId: string): GameState {
    console.log(`Принудительная разблокировка элемента: ${itemId}`);
    
    const newState = { ...state };
    
    // Обновляем флаг разблокировки
    newState.unlocks = {
      ...newState.unlocks,
      [itemId]: true
    };
    
    // Если элемент - здание
    if (itemId in newState.buildings) {
      newState.buildings = {
        ...newState.buildings,
        [itemId]: {
          ...newState.buildings[itemId],
          unlocked: true
        }
      };
    }
    
    // Если элемент - исследование
    if (itemId in newState.upgrades) {
      newState.upgrades = {
        ...newState.upgrades,
        [itemId]: {
          ...newState.upgrades[itemId],
          unlocked: true
        }
      };
    }
    
    // Если элемент - ресурс
    if (itemId in newState.resources) {
      newState.resources = {
        ...newState.resources,
        [itemId]: {
          ...newState.resources[itemId],
          unlocked: true
        }
      };
    }
    
    console.log(`Элемент ${itemId} успешно разблокирован`);
    return newState;
  }
  
  /**
   * Получает отладочную информацию о разблокировках
   * @param state Текущее состояние игры
   * @returns Отчет о разблокировках
   */
  getDebugReport(state: GameState): { steps: string[], unlocked: string[], locked: string[] } {
    const unlocked: string[] = [];
    const locked: string[] = [];
    const steps: string[] = [];
    
    steps.push("Проверка разблокировок...");
    
    // Проверяем здания
    Object.entries(state.buildings || {}).forEach(([id, building]) => {
      steps.push(`Проверка здания ${id}: ${building.unlocked ? "разблокировано" : "заблокировано"}`);
      if (building.unlocked) {
        unlocked.push(`Здание: ${building.name || id}`);
      } else {
        locked.push(`Здание: ${building.name || id}`);
      }
    });
    
    // Проверяем исследования
    Object.entries(state.upgrades || {}).forEach(([id, upgrade]) => {
      steps.push(`Проверка исследования ${id}: ${upgrade.unlocked ? "разблокировано" : "заблокировано"}`);
      if (upgrade.unlocked) {
        unlocked.push(`Исследование: ${upgrade.name || id}`);
      } else {
        locked.push(`Исследование: ${upgrade.name || id}`);
      }
    });
    
    // Проверяем ресурсы
    Object.entries(state.resources || {}).forEach(([id, resource]) => {
      steps.push(`Проверка ресурса ${id}: ${resource.unlocked ? "разблокирован" : "заблокирован"}`);
      if (resource.unlocked) {
        unlocked.push(`Ресурс: ${resource.name || id}`);
      } else {
        locked.push(`Ресурс: ${resource.name || id}`);
      }
    });
    
    return { steps, unlocked, locked };
  }
}
