import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { helperStatusCache } from '@/utils/referralHelpers/helperCache';
import { getUserIdentifier } from '@/api/userIdentification';
import { syncHelperStatusWithDB } from '@/utils/referralHelpers/helperStatus';

// Асинхронная функция для прямой проверки статуса помощника в базе данных
async function checkHelperStatusInDB(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    // Получаем количество зданий, где пользователь является помощником, из кеша
    return await helperStatusCache.get(userId, true);
  } catch (error) {
    console.error('Неожиданная ошибка при проверке статуса помощника в БД:', error);
    return 0;
  }
}

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Пытаемся получить ID пользователя сразу из кэша или localStorage
  let currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
  let referralHelperBonus = 0;
  
  // Если у нас есть ID пользователя, проверяем является ли он помощником на основе локального состояния
  if (currentUserId) {
    const buildingsAsHelper = state.referralHelpers.filter(h => 
      h.helperId === currentUserId && h.status === 'accepted'
    ).length;
    
    // Каждое здание, на котором пользователь помогает, дает ему бонус 10%
    referralHelperBonus = buildingsAsHelper * 0.1; // 10% за каждое здание
    
    if (buildingsAsHelper > 0) {
      console.log(`Локальное состояние: Пользователь ${currentUserId} помогает на ${buildingsAsHelper} зданиях, бонус: +${referralHelperBonus * 100}%`);
    }
    
    // Параллельно запрашиваем обновление статуса помощника из БД для будущих расчетов
    // Обновление происходит асинхронно и не блокирует текущее обновление ресурсов
    helperStatusCache.update(currentUserId).then(helperBuildingsCount => {
      // Если данные в БД отличаются от локального состояния
      if (helperBuildingsCount !== buildingsAsHelper) {
        console.log(`БД и локальное состояние различаются: в БД ${helperBuildingsCount} зданий, локально ${buildingsAsHelper}`);
        
        // Запрашиваем полное обновление помощников из БД
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }, 100);
      }
    }).catch(err => {
      console.error('Ошибка при проверке статуса помощника в БД:', err);
    });
  } else {
    // Если ID не найден в кэше, пробуем получить его асинхронно
    getUserIdentifier()
      .then(userId => {
        if (userId) {
          // Сохраняем ID пользователя для быстрого доступа в будущем
          window.__game_user_id = userId;
          localStorage.setItem('crypto_civ_user_id', userId);
          
          console.log(`Получен ID пользователя: ${userId}`);
          
          // Проверяем этого пользователя в качестве помощника
          helperStatusCache.update(userId).then(helperBuildingsCount => {
            if (helperBuildingsCount > 0) {
              console.log(`Новый пользователь ${userId} помогает на ${helperBuildingsCount} зданиях по данным БД`);
              
              // Запрашиваем полное обновление помощников из БД
              setTimeout(() => {
                const refreshEvent = new CustomEvent('refresh-referrals');
                window.dispatchEvent(refreshEvent);
              }, 100);
            }
          });
        }
      })
      .catch(err => console.error('Ошибка при получении идентификатора пользователя:', err));
  }
  
  // Синхронизируем статусы помощников с базой данных в фоновом режиме
  if (state.referralHelpers.length > 0 && currentUserId) {
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
  
  // Рассчитываем производство для всех ресурсов с учетом помощников и рефералов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    currentUserId, 
    referralHelperBonus 
  );
  
  // Применяем увеличение хранилища от зданий
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Создаем копию для применения эффектов от исследований
  // Это предотвращает кумулятивное накопление бонусов при каждом расчете
  const resourcesWithBaseValues = JSON.parse(JSON.stringify(updatedResources));
  
  // Применяем эффекты от исследований поверх базовых значений
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      // Получаем эффекты исследования (поддерживаем оба поля effects и effect)
      const effects = upgrade.effects || upgrade.effect || {};
      
      // Применяем эффекты к скорости накопления ресурсов
      Object.entries(effects).forEach(([effectId, amount]) => {
        if (effectId === 'knowledgeBoost' && resourcesWithBaseValues.knowledge) {
          const boost = Number(amount);
          // Используем baseProduction для предотвращения двойного учета
          const baseProduction = resourcesWithBaseValues.knowledge.baseProduction || 0;
          const boostAmount = baseProduction * boost;
          
          // Увеличиваем скорость накопления знаний
          resourcesWithBaseValues.knowledge.perSecond += boostAmount;
          
          console.log(`Исследование "${upgrade.name}" даёт +${boost * 100}% к скорости накопления знаний: +${boostAmount.toFixed(2)}/сек`);
        }
        else if (effectId.includes('Boost') && !effectId.includes('Max')) {
          // Обрабатываем другие бонусы к скорости
          const resourceId = effectId.replace('Boost', '');
          if (resourcesWithBaseValues[resourceId]) {
            const boost = Number(amount);
            // Используем baseProduction для предотвращения двойного учета
            const baseProduction = resourcesWithBaseValues[resourceId].baseProduction || 0;
            const boostAmount = baseProduction * boost;
            
            // Увеличиваем скорость накопления ресурса
            resourcesWithBaseValues[resourceId].perSecond += boostAmount;
            
            console.log(`Исследование "${upgrade.name}" даёт +${boost * 100}% к скорости накопления ${resourceId}: +${boostAmount.toFixed(2)}/сек`);
          }
        }
      });
    }
  });
  
  // Обновляем значения ресурсов с учетом времени
  const finalResources = updateResourceValues(resourcesWithBaseValues, deltaTime);
  
  return {
    ...state,
    resources: finalResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};
