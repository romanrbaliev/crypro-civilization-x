
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksFromUnlockManager } from '@/utils/unlockManager';

// Проверка условий разблокировки зданий (обертка над функцией из unlockManager)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий через централизованную систему...");
  
  // Добавляем дополнительный лог для улучшения отладки
  console.log("Текущие здания и их статус разблокировки:", Object.entries(state.buildings)
    .map(([id, building]) => `${id}: ${building.unlocked ? 'Разблокировано' : 'Заблокировано'}`));
  
  // Создаем копию состояния перед передачей в централизованную систему разблокировок
  const newState = { ...state };
  
  // ВАЖНО: Практика должна быть видна в оборудовании всегда, когда она разблокирована
  if (newState.unlocks.practice && newState.buildings.practice && !newState.buildings.practice.unlocked) {
    console.log("Исправление: практика должна быть разблокирована в зданиях");
    newState.buildings.practice.unlocked = true;
  }
  
  // ВАЖНО: Электричество должно быть разблокировано ТОЛЬКО после ПОКУПКИ генератора
  // Проверяем явно, что count > 0, а не просто unlocked
  if (newState.buildings.generator && newState.buildings.generator.count === 0 
      && newState.unlocks.electricity) {
    console.log("Исправление: электричество должно быть разблокировано только после ПОКУПКИ генератора");
    
    // Убираем разблокировку электричества, если генератор ещё не куплен
    newState.unlocks.electricity = false;
    
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        unlocked: false
      };
    }
  }
  
  // Явно проверяем, что если генератор куплен, то электричество должно быть разблокировано
  if (newState.buildings.generator && newState.buildings.generator.count > 0 
      && !newState.unlocks.electricity) {
    console.log("Исправление: электричество должно быть разблокировано после покупки генератора");
    
    // Разблокируем электричество
    newState.unlocks.electricity = true;
    
    if (newState.resources.electricity) {
      newState.resources.electricity = {
        ...newState.resources.electricity,
        unlocked: true
      };
    } else {
      // Создаем ресурс электричества если его нет
      newState.resources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      };
    }
    
    // Добавляем уведомление о разблокировке электричества
    safeDispatchGameEvent("Разблокирован новый ресурс: Электричество!", "success");
  }
  
  return checkBuildingUnlocksFromUnlockManager(newState);
};
