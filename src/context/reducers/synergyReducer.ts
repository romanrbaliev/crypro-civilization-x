
import { GameState, GameAction, ReferralHelper } from '../types';

// Функция для проверки синергий
export const checkSynergies = (state: GameState): GameState => {
  const { upgrades, specializationSynergies } = state;

  const updatedSynergies = Object.entries(specializationSynergies).reduce((acc, [synergyId, synergy]) => {
    if (synergy.unlocked || synergy.active) {
      acc[synergyId] = synergy;
      return acc;
    }

    const categoryCounts: { [categoryId: string]: number } = {};
    for (const categoryId of synergy.requiredCategories) {
      categoryCounts[categoryId] = 0;
    }

    Object.values(upgrades).forEach(upgrade => {
      if (upgrade.purchased && upgrade.category && synergy.requiredCategories.includes(upgrade.category)) {
        categoryCounts[upgrade.category]++;
      }
    });

    const allCategoriesFulfilled = synergy.requiredCategories.every(categoryId => categoryCounts[categoryId] >= synergy.requiredCount);

    if (allCategoriesFulfilled) {
      acc[synergyId] = { ...synergy, unlocked: true };
    } else {
      acc[synergyId] = synergy;
    }

    return acc;
  }, {} as { [key: string]: any });

  return {
    ...state,
    specializationSynergies: updatedSynergies,
  };
};

// Функция для активации синергии
export const activateSynergy = (state: GameState, payload: { synergyId: string }): GameState => {
  const { synergyId } = payload;
  const synergy = state.specializationSynergies[synergyId];
  
  if (!synergy || !synergy.unlocked || synergy.active) {
    return state;
  }
  
  const updatedSynergies = {
    ...state.specializationSynergies,
    [synergyId]: { ...synergy, active: true }
  };
  
  return {
    ...state,
    specializationSynergies: updatedSynergies
  };
};

// Функция для инициализации синергий
export const initializeSynergies = (state: GameState): GameState => {
  // Проверяем, существуют ли уже синергии
  if (state.specializationSynergies && Object.keys(state.specializationSynergies).length > 0) {
    return state;
  }

  // Базовые синергии для инициализации
  const defaultSynergies = {
    blockchain_mining: {
      id: 'blockchain_mining',
      name: 'Криптомайнер',
      description: 'Синергия между блокчейном и майнингом',
      requiredCategories: ['blockchain', 'mining'],
      requiredCount: 2,
      bonus: { miningEfficiency: 0.15, energyEfficiency: 0.10 },
      unlocked: false,
      active: false
    },
    trading_investment: {
      id: 'trading_investment',
      name: 'Инвестор-трейдер',
      description: 'Синергия между трейдингом и инвестициями',
      requiredCategories: ['trading', 'investment'],
      requiredCount: 2,
      bonus: { tradingEfficiency: 0.15, investmentReturn: 0.10 },
      unlocked: false,
      active: false
    },
    blockchain_defi: {
      id: 'blockchain_defi',
      name: 'DeFi-разработчик',
      description: 'Синергия между блокчейном и DeFi',
      requiredCategories: ['blockchain', 'defi'],
      requiredCount: 2, 
      bonus: { defiYield: 0.15, smartContractEfficiency: 0.10 },
      unlocked: false,
      active: false
    }
  };

  return {
    ...state,
    specializationSynergies: defaultSynergies
  };
};

// Базовый редьюсер синергий
export const synergyReducer = (state: GameState, action: GameAction): GameState => {
  if (action.type === "CHECK_SYNERGIES") {
    return checkSynergies(state);
  }
  
  if (action.type === "ACTIVATE_SYNERGY") {
    return activateSynergy(state, action.payload);
  }
  
  if (action.type === "RESPOND_TO_HELPER_REQUEST") {
    const { helperId, accepted } = action.payload;
    
    // Найдем запрос
    const helperRequest = state.referralHelpers.find(h => h.id === helperId);
    
    if (!helperRequest) {
      console.warn(`Запрос помощника с ID ${helperId} не найден`);
      return state;
    }
    
    console.log(`Ответ на запрос помощника ${helperId}: ${accepted ? 'принят' : 'отклонен'}`);
    
    // Обновляем статус помощника, явно указывая тип
    const updatedHelpers = state.referralHelpers.map(h => 
      h.id === helperId 
        ? { ...h, status: accepted ? 'accepted' as const : 'rejected' as const } 
        : h
    );
    
    // Если помощник принят, также обновляем UI обоим игрокам
    if (accepted) {
      console.log(`Помощник (${helperRequest.helperId}) принят для здания ${helperRequest.buildingId}`);
      
      // Здесь могла бы быть логика уведомления другого игрока,
      // но это требует асинхронных операций, которые нельзя выполнять в reducer
    }
    
    return {
      ...state,
      referralHelpers: updatedHelpers,
    };
  }
  
  if (action.type === "HIRE_REFERRAL_HELPER") {
    const { referralId, buildingId } = action.payload;
    
    console.log(`Запрос на найм помощника: реферал ${referralId}, здание ${buildingId}`);
    
    // Создаем новый запрос с явным указанием типа status
    const newHelper: ReferralHelper = {
      id: Date.now().toString(),
      buildingId,
      helperId: referralId,
      status: 'pending' as const,
      createdAt: Date.now()
    };
    
    // Добавляем запрос к существующим
    const updatedHelpers = [...state.referralHelpers, newHelper];
    
    return {
      ...state,
      referralHelpers: updatedHelpers,
    };
  }
  
  return state;
};
