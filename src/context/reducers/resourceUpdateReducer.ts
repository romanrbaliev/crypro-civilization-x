
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
  
  // Логируем состояние знаний до обновления
  const knowledgeBefore = state.resources.knowledge?.value || 0;
  const knowledgeProduction = state.resources.knowledge?.perSecond || 0;
  
  console.log(`resourceUpdateReducer: Знания ДО: ${knowledgeBefore.toFixed(6)}, производство: ${knowledgeProduction.toFixed(6)}/сек`);
  
  // Расчет ожидаемого прироста для проверки
  const expectedIncrement = (knowledgeProduction * deltaTime / 1000);
  console.log(`resourceUpdateReducer: Ожидаемый прирост знаний за ${deltaTime}ms: ${expectedIncrement.toFixed(6)}`);
  
  // Вычисляем новое значение
  const calculatedValue = knowledgeBefore + expectedIncrement;
  console.log(`resourceUpdateReducer: Вычисленное новое значение: ${calculatedValue.toFixed(6)}`);
  
  // Обновляем ресурсы, используя ResourceSystem
  const updatedState = { ...state };
  
  // Обновляем значение ресурса знаний, если он разблокирован
  if (updatedState.resources.knowledge && updatedState.resources.knowledge.unlocked) {
    // Максимальное значение для ресурса знаний
    const maxValue = updatedState.resources.knowledge.max || Infinity;
    // Проверяем, чтобы новое значение не превышало максимум
    const newValue = Math.min(calculatedValue, maxValue);
    
    updatedState.resources = {
      ...updatedState.resources,
      knowledge: {
        ...updatedState.resources.knowledge,
        value: newValue
      }
    };
    
    console.log(`resourceUpdateReducer: Установлено новое значение знаний: ${newValue.toFixed(6)}, ограничено максимумом: ${maxValue}`);
  }
  
  // Логируем состояние знаний после обновления
  const knowledgeAfter = updatedState.resources.knowledge?.value || 0;
  const knowledgeDelta = knowledgeAfter - knowledgeBefore;
  
  console.log(`resourceUpdateReducer: Знания ПОСЛЕ: ${knowledgeAfter.toFixed(6)}, прирост: ${knowledgeDelta.toFixed(6)} (за ${deltaTime}ms)`);
  
  // Создаем событие обновления значения знаний
  if (Math.abs(knowledgeDelta) > 0.000001) {
    try {
      window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
        detail: { 
          oldValue: knowledgeBefore,
          newValue: knowledgeAfter,
          delta: knowledgeDelta,
          source: 'resource-update',
          deltaTime
        }
      }));
      console.log("resourceUpdateReducer: Отправлено событие knowledge-value-updated");
    } catch (e) {
      console.error("resourceUpdateReducer: Ошибка при отправке события:", e);
    }
  } else if (knowledgeProduction > 0) {
    console.warn(`resourceUpdateReducer: Внимание! Производство знаний > 0, но значение не изменилось!`);
  }
  
  // Возвращаем обновленное состояние
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
