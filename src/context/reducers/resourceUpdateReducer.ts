
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasBlockchainBasics, isBlockchainBasicsUnlocked } from '@/utils/researchUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Полностью удаляем логику активации рефералов отсюда!
  // Активация должна происходить только при покупке "Основы блокчейна" или
  // при явной синхронизации с базой данных
  
  // Этап 2: Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    state.referralCode
  );
  
  // Этап 3: Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Этап 4: Обновляем значения ресурсов с учетом времени
  updatedResources = updateResourceValues(updatedResources, deltaTime);
  
  return {
    ...state,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};
