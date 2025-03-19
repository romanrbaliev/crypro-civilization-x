
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Полностью удаляем логику активации рефералов отсюда!
  
  // Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    state.referralCode
  );
  
  // Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Применяем эффекты от исследований
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      // Получаем эффекты исследования (поддерживаем оба поля effects и effect)
      const effects = upgrade.effects || upgrade.effect || {};
      
      // Применяем эффекты к скорости накопления ресурсов
      Object.entries(effects).forEach(([effectId, amount]) => {
        if (effectId === 'knowledgeBoost' && updatedResources.knowledge) {
          const boost = Number(amount);
          const baseProduction = updatedResources.knowledge.perSecond;
          const boostAmount = baseProduction * boost;
          
          // Увеличиваем скорость накопления знаний
          updatedResources.knowledge.perSecond += boostAmount;
          updatedResources.knowledge.production += boostAmount;
          
          console.log(`Исследование "${upgrade.name}" даёт +${boost * 100}% к скорости накопления знаний: +${boostAmount.toFixed(2)}/сек`);
        }
        else if (effectId.includes('Boost') && !effectId.includes('Max')) {
          // Обрабатываем другие бонусы к скорости
          const resourceId = effectId.replace('Boost', '');
          if (updatedResources[resourceId]) {
            const boost = Number(amount);
            const baseProduction = updatedResources[resourceId].perSecond;
            const boostAmount = baseProduction * boost;
            
            // Увеличиваем скорость накопления ресурса
            updatedResources[resourceId].perSecond += boostAmount;
            updatedResources[resourceId].production += boostAmount;
            
            console.log(`Исследование "${upgrade.name}" даёт +${boost * 100}% к скорости накопления ${resourceId}: +${boostAmount.toFixed(2)}/сек`);
          }
        }
      });
    }
  });
  
  // Обновляем значения ресурсов с учетом времени
  updatedResources = updateResourceValues(updatedResources, deltaTime);
  
  // Добавляем логирование для отладки состояния помощников 
  // (но без авто-обновления и только если есть активные помощники)
  const activeHelpers = state.referralHelpers.filter(h => h.status === 'accepted');
  if (activeHelpers.length > 0) {
    console.log(`Активные помощники (${activeHelpers.length}):`);
    activeHelpers.forEach(helper => {
      const buildingName = state.buildings[helper.buildingId]?.name || helper.buildingId;
      console.log(`- ${helper.helperId} помогает со зданием "${buildingName}"`);
    });
  }
  
  return {
    ...state,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};
