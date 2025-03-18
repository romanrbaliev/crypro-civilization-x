
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Этап 1: Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    state.referralCode
  );
  
  // Этап 2: Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Этап 3: Обновляем значения ресурсов с учетом времени
  updatedResources = updateResourceValues(updatedResources, deltaTime);
  
  return {
    ...state,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};
