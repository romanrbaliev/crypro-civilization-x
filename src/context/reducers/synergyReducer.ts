import { GameState, GameAction } from '../types';

export const synergyReducer = (state: GameState, action: GameAction): GameState => {
  if (action.type === "CHECK_SYNERGIES") {
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
  }
  
  if (action.type === "ACTIVATE_SYNERGY") {
    const { synergyId } = action.payload;
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
    
    // Обновляем статус помощника
    const updatedHelpers = state.referralHelpers.map(h => 
      h.id === helperId 
        ? { ...h, status: accepted ? 'accepted' : 'rejected' } 
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
    
    // Создаем новый запрос
    const newHelper = {
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
