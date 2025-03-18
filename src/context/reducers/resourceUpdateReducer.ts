
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasBlockchainBasics, isBlockchainBasicsUnlocked } from '@/utils/researchUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Этап 1: Проверяем все рефералы на правильность статуса активации по наличию разблокированного
  // исследования "Основы блокчейна" (blockchain_basics или basicBlockchain)
  let validatedReferrals = [...state.referrals];
  let referralsChanged = false;
  
  // Проходим по каждому рефералу и проверяем его статус
  validatedReferrals = state.referrals.map(referral => {
    // Проверяем статус активации реферала
    // Реферал считается активированным только если у пользователя разблокировано исследование "Основы блокчейна"
    
    // Получаем текущий статус наличия исследования
    const userHasBasicBlockchainUnlocked = isBlockchainBasicsUnlocked(state.upgrades);
    console.log('Пользователь', userHasBasicBlockchainUnlocked ? 'имеет' : 'НЕ имеет', 'разблокированное исследование "Основы блокчейна"');
    
    if (userHasBasicBlockchainUnlocked && !referral.activated) {
      // Если у пользователя разблокировано исследование, но реферал не активирован - активируем его
      console.log(`Исправляем статус активации реферала ${referral.id}: был неактивен, но у пользователя разблокированы "Основы блокчейна"`);
      referralsChanged = true;
      return { ...referral, activated: true };
    }
    
    if (!userHasBasicBlockchainUnlocked && referral.activated) {
      // Если у пользователя не разблокировано исследование, но реферал активирован - деактивируем его
      console.log(`Исправляем статус активации реферала ${referral.id}: был активен, но у пользователя не разблокированы "Основы блокчейна"`);
      referralsChanged = true;
      return { ...referral, activated: false };
    }
    
    // Если статус соответствует текущему состоянию разблокировки исследования, оставляем как есть
    return referral;
  });
  
  // Если были изменения в рефералах, создаем новый state
  const stateWithValidReferrals = 
    referralsChanged 
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
