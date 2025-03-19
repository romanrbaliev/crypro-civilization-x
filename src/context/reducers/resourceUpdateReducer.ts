
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasActiveHelpers, syncHelperStatusWithDB } from '@/utils/referralHelperUtils';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Синхронизируем статусы помощников с базой данных
  // Это поможет исправить несоответствие между локальным состоянием и БД
  let updatedState = { ...state };
  if (state.referralHelpers.length > 0) {
    syncHelperStatusWithDB(state.referralHelpers)
      .then(updatedHelpers => {
        if (updatedHelpers && updatedHelpers.length > 0) {
          // Отправляем событие для обновления состояния игры
          const updateEvent = new CustomEvent('helpers-updated', {
            detail: { updatedHelpers }
          });
          window.dispatchEvent(updateEvent);
          
          console.log('Помощники синхронизированы с базой данных:', updatedHelpers);
        }
      })
      .catch(err => console.error('Ошибка при синхронизации помощников:', err));
  }
  
  // Проверяем, является ли текущий пользователь помощником для других игроков
  // и учитываем бонус в 10% за каждое здание, на котором он помогает
  const currentUserId = state.referralCode ? await getUserIdentifier() : null; // Используем user_id вместо referralCode
  let referralHelperBonus = 0;
  
  if (currentUserId) {
    const buildingsAsHelper = state.referralHelpers.filter(h => 
      h.helperId === currentUserId && h.status === 'accepted'
    ).length;
    
    // Каждое здание, на котором пользователь помогает, дает ему бонус 10%
    referralHelperBonus = buildingsAsHelper * 0.1; // 10% за каждое здание
    
    if (buildingsAsHelper > 0) {
      console.log(`Пользователь ${currentUserId} помогает на ${buildingsAsHelper} зданиях, бонус: +${referralHelperBonus * 100}%`);
    }
  }
  
  // Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    currentUserId, // Передаем user_id вместо referralCode
    referralHelperBonus // Передаем бонус для реферала-помощника
  );
  
  // Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Применяем эффекты от исследований - только к perSecond, не кумулятивно!
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      // Получаем эффекты исследования (поддерживаем оба поля effects и effect)
      const effects = upgrade.effects || upgrade.effect || {};
      
      // Применяем эффекты к скорости накопления ресурсов
      Object.entries(effects).forEach(([effectId, amount]) => {
        if (effectId === 'knowledgeBoost' && updatedResources.knowledge) {
          const boost = Number(amount);
          // Используем baseProduction вместо perSecond для предотвращения двойного учета
          const baseProduction = updatedResources.knowledge.baseProduction || 0;
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
            // Используем baseProduction вместо perSecond для предотвращения двойного учета
            const baseProduction = updatedResources[resourceId].baseProduction || 0;
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
  if (hasActiveHelpers(state.referralHelpers)) {
    const activeHelpers = state.referralHelpers.filter(h => h.status === 'accepted');
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

// Импортируем функцию getUserIdentifier
import { getUserIdentifier } from '@/api/userIdentification';
