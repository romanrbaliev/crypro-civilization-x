
import { GameState } from '../types';
import { SpecializationSynergy } from '../types';

/**
 * Обработка активации синергии специализации
 */
export const processActivateSynergy = (state: GameState, payload: { synergyId: string }): GameState => {
  const { synergyId } = payload;
  
  // Проверяем наличие синергий специализации
  if (!state.specializationSynergies || !state.specializationSynergies[synergyId]) {
    console.warn(`Синергия ${synergyId} не найдена`);
    return state;
  }
  
  // Получаем синергию
  const synergy = state.specializationSynergies[synergyId];
  
  // Если синергия уже активна, ничего не делаем
  if (synergy.active) {
    return state;
  }
  
  // Проверяем условия активации
  // Например, необходимое количество определенных категорий исследований
  if (synergy.requiredCategories && synergy.requiredCategories.length > 0) {
    // Проверяем по категориям
    const categoryMatches: { [category: string]: number } = {};
    
    // Проверяем исследования
    Object.values(state.upgrades).forEach(upgrade => {
      if (upgrade.purchased && upgrade.category && 
          synergy.requiredCategories?.includes(upgrade.category)) {
        categoryMatches[upgrade.category] = (categoryMatches[upgrade.category] || 0) + 1;
      }
    });
    
    // Проверяем количество исследований в каждой категории
    const requiredCount = synergy.requiredCount || 1;
    
    // Если не все категории имеют достаточное количество исследований, возвращаем исходное состояние
    if (Object.keys(categoryMatches).length < synergy.requiredCategories.length) {
      console.log(`Недостаточно категорий для активации синергии ${synergy.name}`);
      return state;
    }
    
    // Проверяем количество исследований в каждой категории
    for (const category of synergy.requiredCategories) {
      if (!categoryMatches[category] || categoryMatches[category] < requiredCount) {
        console.log(`Недостаточно исследований в категории ${category} для активации синергии ${synergy.name}`);
        return state;
      }
    }
  }
  
  // Активируем синергию
  return {
    ...state,
    specializationSynergies: {
      ...state.specializationSynergies,
      [synergyId]: {
        ...synergy,
        active: true
      }
    }
  };
};

/**
 * Обработка проверки и автоматической активации синергий
 */
export const processCheckSynergies = (state: GameState): GameState => {
  // Проверяем наличие синергий
  if (!state.specializationSynergies) {
    return state;
  }
  
  let newState = { ...state };
  
  // Проверяем каждую синергию
  for (const synergyId in state.specializationSynergies) {
    // Если синергия уже активна, пропускаем
    if (state.specializationSynergies[synergyId].active) {
      continue;
    }
    
    // Проверяем условия активации и активируем при необходимости
    newState = processActivateSynergy(newState, { synergyId });
  }
  
  return newState;
};

/**
 * Создаем синергию по умолчанию
 */
export const createDefaultSynergy = (id: string, name: string, description: string): SpecializationSynergy => {
  return {
    id,
    name,
    description,
    requiredCategories: [],
    requiredCount: 1,
    effects: {},
    unlocked: true,
    active: false
  };
};

/**
 * Создаем специализированную синергию
 */
export const createSpecializedSynergy = (
  id: string,
  name: string,
  description: string,
  requiredCategories: string[],
  requiredCount: number,
  effects: { [resourceId: string]: number }
): SpecializationSynergy => {
  return {
    id,
    name,
    description,
    requiredCategories,
    requiredCount,
    effects,
    unlocked: true,
    active: false
  };
};

/**
 * Синхронизация синергий с текущим состоянием игры
 */
export const syncSynergies = (state: GameState): GameState => {
  if (!state.specializationSynergies) {
    state.specializationSynergies = {};
  }
  
  // Проверяем условия активации для всех синергий
  return processCheckSynergies(state);
};
