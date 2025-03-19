
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Полностью удаляем логику активации рефералов отсюда!
  
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
  
  // Логирование для отладки состояния помощников
  if (state.referralHelpers && state.referralHelpers.length > 0) {
    const activeHelpers = state.referralHelpers.filter(h => h.status === 'accepted');
    if (activeHelpers.length > 0) {
      console.log(`Активные помощники (всего ${activeHelpers.length}):`, 
        activeHelpers.map(h => ({
          id: h.id,
          helperId: h.helperId,
          buildingId: h.buildingId,
          buildingName: state.buildings[h.buildingId]?.name || h.buildingId
        }))
      );
    }
  }
  
  return {
    ...state,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};
