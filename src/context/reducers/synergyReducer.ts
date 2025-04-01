
import { GameState, SpecializationSynergy } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Проверка условий активации синергий
export const checkSynergies = (state: GameState): GameState => {
  // Получаем все существующие синергии
  const synergies = { ...state.specializationSynergies };
  
  // Проверяем каждую синергию
  for (const synergy of Object.values(synergies)) {
    if (synergy.active) continue; // Пропускаем уже активные синергии
    
    // Проверяем требования категорий для этой синергии
    const requiredCategoriesCount: {[key: string]: number} = {};
    
    // Инициализируем счетчики для всех требуемых категорий
    synergy.requiredCategories.forEach(category => {
      requiredCategoriesCount[category] = 0;
    });
    
    // Подсчитываем исследования в каждой категории
    Object.values(state.upgrades).forEach(upgrade => {
      // Если улучшение приобретено и его категория есть в требуемых, увеличиваем счетчик
      if (upgrade.purchased && upgrade.category && synergy.requiredCategories.includes(upgrade.category)) {
        requiredCategoriesCount[upgrade.category] = (requiredCategoriesCount[upgrade.category] || 0) + 1;
      }
    });
    
    // Проверяем, выполнены ли все требования
    const allRequirementsMet = Object.entries(requiredCategoriesCount).every(
      ([_, count]) => count >= synergy.requiredCount
    );
    
    // Обновляем статус разблокировки
    if (allRequirementsMet && !synergy.unlocked) {
      console.log(`Разблокирована синергия: ${synergy.name}`);
      synergy.unlocked = true;
      safeDispatchGameEvent(`Разблокирована новая синергия: ${synergy.name}`, "info");
    }
  }
  
  return {
    ...state,
    specializationSynergies: synergies
  };
};

// Активация синергии
export const activateSynergy = (state: GameState, payload: { synergyId: string }): GameState => {
  const { synergyId } = payload;
  const synergy = state.specializationSynergies[synergyId];
  
  if (!synergy || !synergy.unlocked || synergy.active) {
    return state;
  }
  
  // Активируем синергию
  const updatedSynergies = {
    ...state.specializationSynergies,
    [synergyId]: {
      ...synergy,
      active: true
    }
  };
  
  return synergyReducer({
    ...state,
    specializationSynergies: updatedSynergies
  });
};

// Начальные синергии
export const initialSynergies: {[key: string]: SpecializationSynergy} = {
  blockchain_mining: {
    id: "blockchain_mining",
    name: "Эффективный майнинг",
    description: "Сочетание знаний блокчейна и оптимизации майнинга",
    requiredCategories: ["blockchain", "mining"],
    requiredCount: 2,
    bonus: {
      miningEfficiency: 0.15,
      energyEfficiency: 0.10
    },
    unlocked: false,
    active: false
  },
  trading_investment: {
    id: "trading_investment",
    name: "Финансовая стратегия",
    description: "Комбинация трейдинга и долгосрочных инвестиций",
    requiredCategories: ["trading", "investment"],
    requiredCount: 2,
    bonus: {
      tradingEfficiency: 0.15,
      investmentReturn: 0.10
    },
    unlocked: false,
    active: false
  },
  blockchain_defi: {
    id: "blockchain_defi",
    name: "Децентрализованные финансы",
    description: "Применение блокчейна в финансовых инструментах",
    requiredCategories: ["blockchain", "defi"],
    requiredCount: 2,
    bonus: {
      defiYield: 0.20,
      networkFee: -0.05
    },
    unlocked: false,
    active: false
  }
};

// Инициализация синергий
export const initializeSynergies = (state: GameState): GameState => {
  // Если синергии уже есть, ничего не делаем
  if (state.specializationSynergies && Object.keys(state.specializationSynergies).length > 0) {
    return state;
  }
  
  console.log('Инициализация начальных синергий');
  
  return {
    ...state,
    specializationSynergies: initialSynergies
  };
};

// Применение эффектов активных синергий
export const synergyReducer = (state: GameState): GameState => {
  // Получаем все активные синергии
  const activeSynergies = Object.values(state.specializationSynergies).filter(s => s.active);
  
  // Если нет активных синергий, возвращаем состояние без изменений
  if (activeSynergies.length === 0) {
    return state;
  }
  
  // Применяем бонусы от активных синергий
  const newState = { ...state };
  
  // Здесь реализуем логику применения бонусов синергий
  // Например, увеличение эффективности майнинга, снижение затрат энергии и т.д.
  
  return newState;
};
