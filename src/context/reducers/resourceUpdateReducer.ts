
import { GameState } from '../types';
import { GameStateService } from '@/services/GameStateService';
import { ResourceProductionService } from '@/services/ResourceProductionService';

// Создаем экземпляры необходимых сервисов
const gameStateService = new GameStateService();
const resourceProductionService = new ResourceProductionService();

/**
 * Процесс обновления ресурсов на основе прошедшего времени
 */
export const processUpdateResources = (state: GameState, payload?: { deltaTime?: number }): GameState => {
  if (!state.gameStarted) return state;
  
  console.log("processUpdateResources: Запуск обновления ресурсов");

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
    
    // Сначала обновляем производство и потребление всех ресурсов
    newState = {
      ...newState,
      resources: resourceProductionService.calculateResourceProduction(newState)
    };
    
    // Проверяем все здания и производство с помощью сервиса
    newState = gameStateService.processGameStateUpdate(newState);
    
    // Теперь обновляем текущие значения ресурсов на основе их производства
    const updatedResources = { ...newState.resources };
    const secondsFraction = deltaTime / 1000; // Переводим миллисекунды в секунды
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем проверку каждого ресурса
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
      
      // Логгируем только если есть изменение в знаниях для отладки
      if (resourceId === 'knowledge' && Math.abs(delta) > 0.00001) {
        console.log(`processUpdateResources: Изменение знаний: ${currentValue.toFixed(2)} + ${delta.toFixed(2)} = ${newValue.toFixed(2)} (макс: ${maxValue})`);
      }
    }
    
    return {
      ...newState,
      resources: updatedResources
    };
  } catch (error) {
    console.error("Ошибка при обновлении ресурсов:", error);
    return state;
  }
};
