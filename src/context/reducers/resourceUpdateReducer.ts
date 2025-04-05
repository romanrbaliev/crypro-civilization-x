
import { GameState } from '../types';
import { GameStateService } from '@/services/GameStateService';
import { ResourceProductionService } from '@/services/ResourceProductionService';
import { UnlockService } from '@/services/UnlockService';
import { UnlockManager } from '@/systems/unlock/UnlockManager';

// Создаем экземпляры необходимых сервисов
const gameStateService = new GameStateService();
const resourceProductionService = new ResourceProductionService();
const unlockService = new UnlockService();

/**
 * Процесс обновления ресурсов на основе прошедшего времени
 */
export const processUpdateResources = (state: GameState, payload?: { deltaTime?: number }): GameState => {
  if (!state.gameStarted) return state;
  
  try {
    // Получаем время, прошедшее с последнего обновления
    const now = Date.now();
    const deltaTime = payload?.deltaTime || (now - (state.lastUpdate || now));
    
    // Если прошло слишком мало времени, пропускаем обновление
    if (deltaTime < 10) return state;
    
    // Создаем новое состояние, обновляя время последнего обновления
    let newState = {
      ...state,
      lastUpdate: now
    };
    
    // ИСПРАВЛЕНИЕ: Перед расчетом производства, сбрасываем perSecond для всех ресурсов
    // чтобы предотвратить накопительный эффект
    const resetResources = { ...newState.resources };
    for (const resourceId in resetResources) {
      resetResources[resourceId] = {
        ...resetResources[resourceId],
        perSecond: 0  // Сброс скорости накопления перед пересчетом
      };
    }
    newState = { ...newState, resources: resetResources };
    
    // Обрабатываем состояние с помощью GameStateService
    newState = gameStateService.processGameStateUpdate(newState);
    
    // Используем новую систему разблокировок для проверки условий
    const unlockManager = new UnlockManager(newState);
    newState = unlockManager.updateGameState(newState);
    
    // Обновляем текущие значения ресурсов на основе их производства
    const updatedResources = { ...newState.resources };
    const secondsFraction = deltaTime / 1000; // Переводим миллисекунды в секунды
    
    // Обновляем значения всех ресурсов
    for (const resourceId in updatedResources) {
      const resource = updatedResources[resourceId];
      
      // Пропускаем нерелевантные или неразблокированные ресурсы
      if (!resource || !resource.unlocked) continue;
      
      // Получаем текущее значение для ресурса
      const currentValue = resource.value || 0;
      
      // Вычисляем изменение на основе скорости в секунду
      const perSecondValue = resource.perSecond || 0;
      const delta = perSecondValue * secondsFraction;
      
      // Проверяем, не превысит ли новое значение максимальное
      const maxValue = resource.max || Infinity;
      
      // Вычисляем новое значение с учетом ограничений
      let newValue = currentValue + delta;
      newValue = Math.max(0, Math.min(maxValue, newValue));
      
      // Обновляем значение ресурса
      updatedResources[resourceId] = {
        ...resource,
        value: newValue
      };
    }
    
    // Проверяем разблокировку кнопки "Применить знания"
    const knowledgeClicks = newState.counters.knowledgeClicks?.value || 0;
    let newUnlocks = { ...newState.unlocks };
    
    if (knowledgeClicks >= 3 && !newUnlocks.applyKnowledge) {
      newUnlocks.applyKnowledge = true;
    }
    
    // Проверяем разблокировку здания "Практика"
    const applyKnowledgeCount = newState.counters.applyKnowledge?.value || 0;
    if (applyKnowledgeCount >= 2 && !newState.buildings.practice?.unlocked) {
      const newBuildings = { ...newState.buildings };
      if (newBuildings.practice) {
        newBuildings.practice = {
          ...newBuildings.practice,
          unlocked: true
        };
        newUnlocks.practice = true;
      }
    }
    
    // Проверяем разблокировку здания "Генератор"
    const usdtValue = updatedResources.usdt?.value || 0;
    if (usdtValue >= 11 && !newState.buildings.generator?.unlocked) {
      const newBuildings = { ...newState.buildings };
      if (newBuildings.generator) {
        newBuildings.generator = {
          ...newBuildings.generator,
          unlocked: true
        };
        newUnlocks.generator = true;
      }
    }
    
    return {
      ...newState,
      resources: updatedResources,
      unlocks: newUnlocks
    };
  } catch (error) {
    console.error("Ошибка при обновлении ресурсов:", error);
    return state;
  }
};
