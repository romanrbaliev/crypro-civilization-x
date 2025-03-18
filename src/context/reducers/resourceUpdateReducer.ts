
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasBlockchainBasics, isBlockchainBasicsUnlocked } from '@/utils/researchUtils';
import { activateReferral } from '@/api/referralService';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Этап 1: Проверяем статус активации рефералов
  let validatedReferrals = [...state.referrals];
  let referralsChanged = false;
  
  // Проходим по каждому рефералу и проверяем его статус
  validatedReferrals = state.referrals.map(referral => {
    // Проверяем статус активации реферала
    // Получаем текущий статус наличия исследования
    const userHasBasicBlockchainUnlocked = isBlockchainBasicsUnlocked(state.upgrades);
    
    // Явно приводим значение activated к булевому типу для надежности
    const currentlyActivated = referral.activated === true;
    
    if (userHasBasicBlockchainUnlocked && !currentlyActivated) {
      // Если у пользователя разблокировано исследование, но реферал не активирован - активируем его
      console.log(`Исправляем статус активации реферала ${referral.id}: был неактивен, но у пользователя разблокированы "Основы блокчейна"`);
      
      // Асинхронно вызываем API для активации реферала
      setTimeout(() => {
        activateReferral(referral.id)
          .then(success => {
            console.log(`Результат асинхронной активации реферала ${referral.id}: ${success ? 'успешно' : 'неудачно'}`);
            
            // Если активация прошла успешно, отправляем событие обновления
            if (success) {
              try {
                const updateEvent = new CustomEvent('referral-activated', {
                  detail: { referralId: referral.id }
                });
                window.dispatchEvent(updateEvent);
                console.log(`Отправлено событие активации для реферала ${referral.id}`);
              } catch (error) {
                console.error(`Ошибка при отправке события активации реферала:`, error);
              }
            }
          })
          .catch(err => {
            console.error(`Ошибка при асинхронной активации реферала ${referral.id}:`, err);
          });
      }, 0);
      
      referralsChanged = true;
      return { ...referral, activated: true };
    }
    
    // Сохраняем исходное значение activated, не пытаясь автоматически деактивировать
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
  
  return {
    ...stateWithValidReferrals,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: stateWithValidReferrals.gameTime + deltaTime
  };
};
