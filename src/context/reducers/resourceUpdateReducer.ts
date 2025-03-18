
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Этап 1: Проверяем все рефералы на правильность статуса активации по наличию исследования
  // "Основы блокчейна" (blockchain_basics или basicBlockchain)
  const validatedReferrals = state.referrals.map(referral => {
    // Проверка на активированность основывается на покупке исследования "Основы блокчейна"
    // Для этого нам нужно загрузить состояние игры этого реферала и проверить
    // статус исследования "Основы блокчейна"
    
    // Но для простоты реализации мы оставляем текущую логику проверки через флаг activated
    return referral;
  });
  
  // Если были изменения в рефералах, создаем новый state
  const stateWithValidReferrals = 
    JSON.stringify(validatedReferrals) !== JSON.stringify(state.referrals) 
      ? { ...state, referrals: validatedReferrals }
      : state;
  
  // Этап 2: Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    stateWithValidReferrals.resources, 
    stateWithValidReferrals.buildings, 
    stateWithValidReferrals.referralHelpers,
    stateWithValidReferrals.referrals,
    stateWithValidReferrals.referralCode
  );
  
  // Этап 3: Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, stateWithValidReferrals.buildings);
  
  // Этап 4: Обновляем значения ресурсов с учетом времени
  updatedResources = updateResourceValues(updatedResources, deltaTime);
  
  // Выводим текущую информацию о производстве в консоль (только для разблокированных ресурсов)
  Object.entries(updatedResources).forEach(([resourceId, resource]) => {
    if (resource.unlocked && resource.perSecond !== 0) {
      console.log(`Ресурс ${resource.name}: ${resource.perSecond.toFixed(2)}/сек, максимум ${resource.max}, текущее ${resource.value.toFixed(1)}`);
    }
  });
  
  return {
    ...stateWithValidReferrals,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: stateWithValidReferrals.gameTime + deltaTime
  };
};
