
import { GameState, SpecializationSynergy } from '@/types/game';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export const initializeSynergies = (state: GameState): GameState => {
  // Создаем базовый набор синергий
  const synergies: Record<string, SpecializationSynergy> = {
    // Технологическая синергия
    techSynergy: {
      id: 'techSynergy',
      name: 'Технологическая синергия',
      description: 'Оптимизирует работу компьютеров и майнеров, повышая их эффективность на 20%',
      active: false,
      unlocked: state.upgrades.blockchainBasics?.purchased,
      requiredCategories: ['tech', 'mining'],
      bonus: { productionBoost: 0.2 },
      requirement: 'tech',
      // Исправляем тип effects, чтобы соответствовал интерфейсу
      effects: { homeComputer: 1.2, miner: 1.2 }
    },
    
    // Образовательная синергия
    eduSynergy: {
      id: 'eduSynergy',
      name: 'Образовательная синергия',
      description: 'Повышает эффективность обучения и применения знаний на 15%',
      active: false,
      unlocked: state.upgrades.cryptoSecurity?.purchased,
      requiredCategories: ['education', 'research'],
      bonus: { knowledgeBoost: 0.15 },
      requirement: 'education',
      // Исправляем тип effects, чтобы соответствовал интерфейсу
      effects: { practice: 1.15 }
    },
    
    // Финансовая синергия
    finSynergy: {
      id: 'finSynergy',
      name: 'Финансовая синергия',
      description: 'Оптимизирует хранение и конвертацию криптовалют, увеличивая вместимость кошельков на 25%',
      active: false,
      unlocked: state.upgrades.cryptoBasics?.purchased,
      requiredCategories: ['finance', 'storage'],
      bonus: { storageBoost: 0.25 },
      requirement: 'finance',
      // Исправляем тип effects, чтобы соответствовал интерфейсу
      effects: { cryptoWallet: 1.25 }
    }
  };
  
  return {
    ...state,
    specializationSynergies: synergies
  };
};

export const checkSynergies = (state: GameState): GameState => {
  const { specializationSynergies, upgrades } = state;
  
  // Обновляем статус разблокировки для каждой синергии
  const updatedSynergies = { ...specializationSynergies };
  
  // Технологическая синергия
  if (updatedSynergies.techSynergy) {
    updatedSynergies.techSynergy.unlocked = upgrades.blockchainBasics?.purchased;
  }
  
  // Образовательная синергия
  if (updatedSynergies.eduSynergy) {
    updatedSynergies.eduSynergy.unlocked = upgrades.cryptoSecurity?.purchased;
  }
  
  // Финансовая синергия
  if (updatedSynergies.finSynergy) {
    updatedSynergies.finSynergy.unlocked = upgrades.cryptoBasics?.purchased;
  }
  
  return {
    ...state,
    specializationSynergies: updatedSynergies
  };
};

export const activateSynergy = (state: GameState, payload: { synergyId: string }): GameState => {
  const { synergyId } = payload;
  const targetSynergy = state.specializationSynergies[synergyId];
  
  if (!targetSynergy) {
    console.error(`Синергия с ID ${synergyId} не найдена`);
    return state;
  }
  
  if (!targetSynergy.unlocked) {
    console.error(`Синергия ${targetSynergy.name} не разблокирована`);
    safeDispatchGameEvent(`Синергия ${targetSynergy.name} не разблокирована`, "warning");
    return state;
  }
  
  if (targetSynergy.active) {
    console.log(`Синергия ${targetSynergy.name} уже активна`);
    return state;
  }
  
  // Активируем синергию
  const updatedSynergies = { ...state.specializationSynergies };
  updatedSynergies[synergyId] = {
    ...targetSynergy,
    active: true
  };
  
  safeDispatchGameEvent(`Активирована синергия: ${targetSynergy.name}`, "success");
  
  return {
    ...state,
    specializationSynergies: updatedSynergies
  };
};

export const synergyReducer = (state: GameState): GameState => {
  // Проверяем и обновляем все синергии
  return checkSynergies(state);
};
