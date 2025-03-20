
import { GameState } from '../types';

// Обработчик обновления ресурсов
export const processResourceUpdate = (state: GameState, deltaTime: number = 1000): GameState => {
  const resources = { ...state.resources };
  const now = Date.now();
  
  // Коэффициент времени (секунды)
  const timeFactor = deltaTime / 1000;
  
  // Обрабатываем каждый ресурс
  Object.keys(resources).forEach(resourceId => {
    const resource = resources[resourceId];
    
    // Обновляем только разблокированные ресурсы с производством
    if (resource.unlocked && resource.perSecond !== 0) {
      // Рассчитываем новое значение ресурса
      let newValue = resource.value + resource.perSecond * timeFactor;
      
      // Проверяем верхний предел
      if (resource.max > 0 && newValue > resource.max) {
        newValue = resource.max;
      }
      
      // Проверяем нижний предел (не может быть отрицательным)
      if (newValue < 0) {
        newValue = 0;
      }
      
      // Обновляем значение ресурса
      resources[resourceId] = {
        ...resource,
        value: newValue
      };
    }
  });
  
  // Обновляем состояние игры
  return {
    ...state,
    resources,
    lastUpdate: now
  };
};
