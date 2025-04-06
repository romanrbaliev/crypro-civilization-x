
import { GameState } from '../types';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем статический экземпляр для использования вне компонентов
const resourceSystem = new ResourceSystem();

// Определяем функцию для обновления ресурсов
export const updateResources = (state: GameState, deltaTime: number): GameState => {
  console.log(`resourceUpdateReducer: Обновление ресурсов, прошло ${deltaTime}ms`);
  
  if (deltaTime <= 0) {
    console.log("resourceUpdateReducer: deltaTime <= 0, пропускаем обновление");
    return state;
  }
  
  // Логируем состояние знаний до обновления (для отладки монитора)
  const knowledgeBefore = state.resources.knowledge?.value || 0;
  const knowledgeProduction = state.resources.knowledge?.perSecond || 0;
  
  console.log(`resourceUpdateReducer: Знания до обновления: ${knowledgeBefore.toFixed(2)}, производство: ${knowledgeProduction.toFixed(2)}/сек`);
  
  // Обновляем ресурсы, используя ResourceSystem
  const updatedState = resourceSystem.updateResources(state, deltaTime);
  
  // Логируем состояние знаний после обновления
  const knowledgeAfter = updatedState.resources.knowledge?.value || 0;
  const knowledgeDelta = knowledgeAfter - knowledgeBefore;
  
  console.log(`resourceUpdateReducer: Знания после обновления: ${knowledgeAfter.toFixed(2)}, прирост: ${knowledgeDelta.toFixed(4)} (за ${deltaTime}ms)`);
  
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
