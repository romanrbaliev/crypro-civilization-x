
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
  
  // Глубокая копия состояния перед обновлением (для сравнения)
  const stateBefore = JSON.parse(JSON.stringify(state));
  
  // Логируем состояние знаний до обновления
  const knowledgeBefore = state.resources.knowledge?.value || 0;
  const knowledgeProduction = state.resources.knowledge?.perSecond || 0;
  
  console.log(`resourceUpdateReducer: Знания ДО: ${knowledgeBefore.toFixed(4)}, производство: ${knowledgeProduction.toFixed(4)}/сек`);
  
  // Расчет ожидаемого прироста для проверки
  const expectedIncrement = (knowledgeProduction * deltaTime / 1000);
  console.log(`resourceUpdateReducer: Ожидаемый прирост знаний за ${deltaTime}ms: ${expectedIncrement.toFixed(6)}`);
  
  // Обновляем ресурсы, используя ResourceSystem
  const updatedState = resourceSystem.updateResources(state, deltaTime);
  
  // Логируем состояние знаний после обновления
  const knowledgeAfter = updatedState.resources.knowledge?.value || 0;
  const knowledgeDelta = knowledgeAfter - knowledgeBefore;
  
  console.log(`resourceUpdateReducer: Знания ПОСЛЕ: ${knowledgeAfter.toFixed(4)}, прирост: ${knowledgeDelta.toFixed(6)} (за ${deltaTime}ms)`);
  
  // Проверка на проблему с обновлением
  if (knowledgeProduction > 0 && knowledgeDelta < 0.000001 && deltaTime > 100) {
    console.error("resourceUpdateReducer: КРИТИЧЕСКАЯ ПРОБЛЕМА! Производство положительное, но значение не увеличилось!");
    console.log("resourceUpdateReducer: Состояние перед:", JSON.stringify(stateBefore.resources.knowledge));
    console.log("resourceUpdateReducer: Состояние после:", JSON.stringify(updatedState.resources.knowledge));
  }
  
  // Создаем событие обновления значения знаний
  if (Math.abs(knowledgeDelta) > 0.000001) {
    try {
      window.dispatchEvent(new CustomEvent('knowledge-value-updated', { 
        detail: { 
          oldValue: knowledgeBefore,
          newValue: knowledgeAfter,
          delta: knowledgeDelta
        }
      }));
      console.log("resourceUpdateReducer: Отправлено событие knowledge-value-updated");
    } catch (e) {
      console.error("resourceUpdateReducer: Ошибка при отправке события:", e);
    }
  }
  
  // Возвращаем обновленное состояние
  return updatedState;
};

// Функция для расчета производства ресурсов на основе зданий
export const calculateResourceProduction = (state: GameState): GameState => {
  console.log("resourceUpdateReducer: Пересчет производства ресурсов");
  
  // Полностью пересчитываем производство ресурсов
  const updatedState = resourceSystem.recalculateAllResourceProduction(state);
  
  // Выводим состояние производства ресурсов после пересчета
  for (const resourceId in updatedState.resources) {
    const resource = updatedState.resources[resourceId];
    if (resource.unlocked) {
      console.log(`Ресурс ${resourceId}: производство ${resource.production || 0}/сек, потребление ${resource.consumption || 0}/сек, перерасчет ${resource.perSecond || 0}/сек`);
    }
  }
  
  return updatedState;
};
