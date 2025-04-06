
import { GameState } from '@/context/types';

/**
 * Обновляет максимальные значения ресурсов на основе зданий и исследований
 */
export function updateResourceMaxValues(state: GameState): GameState {
  // Базовые максимальные значения ресурсов
  const baseMaxValues = {
    knowledge: 100, // Базовый максимум знаний
    usdt: 100,      // Базовый максимум USDT
    electricity: 50, // Базовый максимум электричества
    computingPower: 20, // Базовый максимум вычислительной мощности
    bitcoin: 0.01    // Базовый максимум Bitcoin
  };
  
  // Создаем копию состояния
  const newState = { ...state };
  const newResources = { ...state.resources };
  
  // Устанавливаем базовые значения
  for (const [resourceId, maxValue] of Object.entries(baseMaxValues)) {
    if (newResources[resourceId]) {
      newResources[resourceId] = {
        ...newResources[resourceId],
        max: maxValue
      };
    }
  }
  
  // Применяем эффекты от зданий
  for (const buildingId in state.buildings) {
    const building = state.buildings[buildingId];
    
    if (building.count > 0 && building.maxResourceEffects) {
      for (const [resourceId, effect] of Object.entries(building.maxResourceEffects)) {
        const resource = newResources[resourceId];
        if (resource) {
          const effectValue = typeof effect === 'number' 
            ? effect * building.count 
            : 0;
          
          resource.max = (resource.max || 0) + effectValue;
        }
      }
    }
  }
  
  // Применяем эффекты от исследований
  for (const upgradeId in state.upgrades) {
    const upgrade = state.upgrades[upgradeId];
    
    if (upgrade.purchased && upgrade.effects) {
      for (const [effectType, effectValue] of Object.entries(upgrade.effects)) {
        if (effectType.includes('MaxBoost')) {
          const resourceId = effectType.replace('MaxBoost', '').toLowerCase();
          const resource = newResources[resourceId];
          
          if (resource) {
            // Увеличиваем максимум на указанный процент
            const boostPercent = typeof effectValue === 'number' ? effectValue : 0;
            resource.max = (resource.max || 0) * (1 + boostPercent);
          }
        }
      }
    }
  }
  
  newState.resources = newResources;
  return newState;
}
