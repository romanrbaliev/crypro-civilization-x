
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

// Определяем функцию для обновления ресурсов
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  console.log(`===== resourceUpdateReducer: Обновление ресурсов =====`);
  console.log(`Прошло ${deltaTime}ms`);
  
  if (deltaTime <= 0) {
    console.log("resourceUpdateReducer: deltaTime <= 0, пропускаем обновление");
    return state;
  }
  
  // Создаем глубокую копию состояния
  const updatedState = JSON.parse(JSON.stringify(state));
  
  // Обрабатываем каждый ресурс по отдельности
  for (const resourceId in updatedState.resources) {
    const resource = updatedState.resources[resourceId];
    
    // Обновляем только разблокированные ресурсы
    if (resource && resource.unlocked) {
      const perSecondRate = resource.perSecond || 0;
      
      // Если есть производство, обновляем значение
      if (Math.abs(perSecondRate) > 0.000001) {
        const currentValue = resource.value || 0;
        const maxValue = resource.max || Infinity;
        
        // Вычисляем прирост за текущий временной промежуток
        const increment = perSecondRate * (deltaTime / 1000);
        
        // Ограничиваем новое значение максимумом
        const newValue = Math.min(currentValue + increment, maxValue);
        
        console.log(`resourceUpdateReducer: ${resourceId} ${currentValue.toFixed(2)} + ${increment.toFixed(2)} = ${newValue.toFixed(2)} (макс. ${maxValue})`);
        
        // Обновляем значение в состоянии
        updatedState.resources[resourceId].value = newValue;
        
        // Отправляем событие обновления только если значение изменилось
        if (Math.abs(newValue - currentValue) > 0.000001 && resourceId === 'knowledge') {
          try {
            window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
              detail: { 
                oldValue: currentValue,
                newValue: newValue,
                delta: newValue - currentValue,
                source: 'resource-update',
                deltaTime
              }
            }));
            console.log(`resourceUpdateReducer: Отправлено событие knowledge-value-updated (${currentValue.toFixed(2)} → ${newValue.toFixed(2)})`);
          } catch (e) {
            console.error("resourceUpdateReducer: Ошибка при отправке события:", e);
          }
        }
      }
    }
  }
  
  return updatedState;
};

// Функция для расчета производства ресурсов на основе зданий
export const calculateResourceProduction = (state: GameState): GameState => {
  console.log("resourceUpdateReducer: Пересчет производства ресурсов");
  
  // Отслеживаем знания до пересчета
  const knowledgeBefore = state.resources.knowledge?.value || 0;
  const knowledgeProductionBefore = state.resources.knowledge?.perSecond || 0;
  
  // Полностью пересчитываем производство ресурсов
  const updatedState = resourceSystem.recalculateAllResourceProduction(state);
  
  // Выводим состояние производства ресурсов после пересчета
  const knowledgeProductionAfter = updatedState.resources.knowledge?.perSecond || 0;
  
  console.log(`resourceUpdateReducer: Производство знаний: ${knowledgeProductionBefore}/сек -> ${knowledgeProductionAfter}/сек`);
  
  // Подробный вывод информации о производстве и потреблении всех ресурсов
  for (const resourceId in updatedState.resources) {
    const resource = updatedState.resources[resourceId];
    if (resource.unlocked) {
      console.log(`Ресурс ${resourceId}: производство ${resource.production || 0}/сек, потребление ${resource.consumption || 0}/сек, перерасчет ${resource.perSecond || 0}/сек`);
    }
  }
  
  // Если это пересчет производства знаний, отправляем специальное событие
  if (Math.abs(knowledgeProductionAfter - knowledgeProductionBefore) > 0.000001) {
    try {
      window.dispatchEvent(new CustomEvent('knowledge-production-updated', { 
        detail: { 
          oldValue: knowledgeProductionBefore,
          newValue: knowledgeProductionAfter,
          delta: knowledgeProductionAfter - knowledgeProductionBefore
        }
      }));
      console.log("resourceUpdateReducer: Отправлено событие knowledge-production-updated");
    } catch (e) {
      console.error("resourceUpdateReducer: Ошибка при отправке события:", e);
    }
  }
  
  return updatedState;
};
