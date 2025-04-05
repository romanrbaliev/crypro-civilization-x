
import { GameState } from '../types';
import { SpecializationSynergy } from '../types';

// Инициализация синергий
export const initializeSynergies = (state: GameState): GameState => {
  // Если синергии уже инициализированы, ничего не делаем
  if (state.specializationSynergies && Object.keys(state.specializationSynergies).length > 0) {
    return state;
  }

  // Определяем базовые синергии для специализаций
  const synergies: { [key: string]: SpecializationSynergy } = {
    miningEfficiency: {
      id: 'miningEfficiency',
      name: 'Эффективность майнинга',
      description: 'Повышает эффективность майнинга и снижает потребление энергии',
      active: false,
      effects: {
        miningEfficiencyBoost: 1.15,
        energyConsumption: 0.9
      },
      requirement: {
        homeComputer: 2,
        miner: 1
      }
    },
    knowledgeBoost: {
      id: 'knowledgeBoost',
      name: 'Ускоренное обучение',
      description: 'Увеличивает скорость получения знаний',
      active: false,
      effects: {
        knowledgeProduction: 1.2
      },
      requirement: {
        practice: 3
      }
    },
    efficientTrading: {
      id: 'efficientTrading',
      name: 'Эффективный трейдинг',
      description: 'Улучшает обмен знаний на USDT и снижает комиссии',
      active: false,
      effects: {
        exchangeRate: 1.1,
        tradingFee: 0.9
      },
      requirement: {
        cryptoWallet: 2
      }
    }
  };

  return {
    ...state,
    specializationSynergies: synergies
  };
};

// Проверка активации синергий
export const checkSynergies = (state: GameState): GameState => {
  if (!state.specializationSynergies) {
    return initializeSynergies(state);
  }

  const { buildings, upgrades } = state;
  const updatedSynergies = { ...state.specializationSynergies };
  let synergyActivated = false;

  // Проверяем каждую синергию на соответствие требованиям
  Object.values(updatedSynergies).forEach(synergy => {
    const canActivate = checkSynergyRequirements(synergy, buildings, upgrades);
    
    if (canActivate && !synergy.active) {
      updatedSynergies[synergy.id].active = true;
      synergyActivated = true;
      console.log(`Синергия активирована: ${synergy.name}`);
    }
  });

  // Если активировали новые синергии, обновляем состояние
  if (synergyActivated) {
    return {
      ...state,
      specializationSynergies: updatedSynergies
    };
  }

  return state;
};

// Проверка требований для активации синергии
function checkSynergyRequirements(
  synergy: SpecializationSynergy,
  buildings: { [key: string]: any },
  upgrades: { [key: string]: any }
): boolean {
  // Проверяем требования к зданиям
  if (synergy.requirement) {
    for (const [buildingId, requiredCount] of Object.entries(synergy.requirement)) {
      const building = buildings[buildingId];
      if (!building || building.count < requiredCount) {
        return false;
      }
    }
  }

  // Проверяем требования к категориям улучшений
  if (synergy.requiredCategories) {
    for (const category of synergy.requiredCategories) {
      const hasCategory = Object.values(upgrades).some(
        upgrade => upgrade.purchased && upgrade.category === category
      );
      if (!hasCategory) {
        return false;
      }
    }
  }

  return true;
}

// Активация синергии вручную
export const activateSynergy = (state: GameState, payload: { synergyId: string }): GameState => {
  const { synergyId } = payload;
  
  if (!state.specializationSynergies || !state.specializationSynergies[synergyId]) {
    return state;
  }

  // Если синергия уже активирована, ничего не делаем
  if (state.specializationSynergies[synergyId].active) {
    return state;
  }

  // Проверяем, можно ли активировать синергию
  const canActivate = checkSynergyRequirements(
    state.specializationSynergies[synergyId],
    state.buildings,
    state.upgrades
  );

  if (!canActivate) {
    console.log(`Не удалось активировать синергию: ${synergyId}`);
    return state;
  }

  const updatedSynergies = {
    ...state.specializationSynergies,
    [synergyId]: {
      ...state.specializationSynergies[synergyId],
      active: true
    }
  };

  return {
    ...state,
    specializationSynergies: updatedSynergies
  };
};

// Редьюсер для синергий
export const synergyReducer = (state: GameState): GameState => {
  // Проверяем и обновляем все синергии
  return checkSynergies(state);
};
