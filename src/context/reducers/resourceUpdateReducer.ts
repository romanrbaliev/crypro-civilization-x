
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasActiveHelpers, syncHelperStatusWithDB } from '@/utils/referralHelperUtils';
import { getUserIdentifier } from '@/api/userIdentification';
import { supabase } from '@/integrations/supabase/client';

export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Пытаемся получить ID пользователя сразу из кэша или localStorage
  let currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
  let referralHelperBonus = 0;
  
  // Если у нас есть ID пользователя, сразу проверяем, является ли он помощником
  if (currentUserId) {
    const buildingsAsHelper = state.referralHelpers.filter(h => 
      h.helperId === currentUserId && h.status === 'accepted'
    ).length;
    
    // Каждое здание, на котором пользователь помогает, дает ему бонус 10%
    referralHelperBonus = buildingsAsHelper * 0.1; // 10% за каждое здание
    
    if (buildingsAsHelper > 0) {
      console.log(`Пользователь ${currentUserId} помогает на ${buildingsAsHelper} зданиях, бонус: +${referralHelperBonus * 100}%`);
    } else {
      // Если локальное состояние показывает, что пользователь не является помощником,
      // проверим напрямую в базе данных, возможно, данные не синхронизированы
      checkHelperStatusInDB(currentUserId).then(helperBuildingsCount => {
        if (helperBuildingsCount > 0) {
          // Пользователь является помощником по данным в БД, но не в локальном состоянии
          console.log(`БД подтверждает: пользователь ${currentUserId} помогает на ${helperBuildingsCount} зданиях, но локальное состояние не обновлено`);
          
          // Принудительно обновляем состояние
          const forceUpdateEvent = new CustomEvent('force-resource-update');
          window.dispatchEvent(forceUpdateEvent);
          
          // Запрашиваем полное обновление помощников из БД
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        } else {
          console.log(`Проверка в БД: пользователь ${currentUserId} не является помощником ни для одного здания`);
        }
      }).catch(err => {
        console.error('Ошибка при проверке статуса помощника в БД:', err);
      });
    }
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
          checkHelperStatusInDB(userId).then(helperBuildingsCount => {
            if (helperBuildingsCount > 0) {
              console.log(`Новый пользователь ${userId} помогает на ${helperBuildingsCount} зданиях по данным БД`);
              
              // Отправляем событие для принудительного обновления ресурсов
              setTimeout(() => {
                const forceUpdateEvent = new CustomEvent('force-resource-update');
                window.dispatchEvent(forceUpdateEvent);
                
                // Запрашиваем полное обновление помощников из БД
                const refreshEvent = new CustomEvent('refresh-referrals');
                window.dispatchEvent(refreshEvent);
              }, 100);
            }
          });
        }
      })
      .catch(err => console.error('Ошибка при получении идентификатора пользователя:', err));
  }
  
  // Синхронизируем статусы помощников с базой данных
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
  } else if (currentUserId) {
    // Если в локальном состоянии нет помощников, проверяем их наличие в БД
    console.log(`В локальном состоянии нет активных помощников. Пользователь ID: ${currentUserId}`);
  }
  
  return {
    ...state,
    resources: updatedResources,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
};

// Новая функция для прямой проверки статуса помощника в базе данных
async function checkHelperStatusInDB(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    console.log(`Проверка статуса помощника напрямую в БД для ${userId}...`);
    
    // Проверка соединения с Supabase перед запросом
    const { data: connectionCheck, error: connectionError } = await supabase
      .from('referral_data')
      .select('user_id')
      .limit(1);
    
    if (connectionError) {
      console.error('Ошибка при проверке соединения с Supabase:', connectionError);
      return 0;
    }
    
    // Запрашиваем данные о помощниках напрямую из таблицы
    const { data, error } = await supabase
      .from('referral_helpers')
      .select('building_id, status')
      .eq('helper_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Ошибка при проверке статуса помощника в БД:', error);
      return 0;
    }
    
    if (data && data.length > 0) {
      console.log(`В БД найдено ${data.length} записей, где ${userId} является активным помощником:`, data);
      // Возвращаем количество зданий, на которых пользователь является помощником
      return data.length;
    } else {
      console.log(`В БД не найдено записей, где ${userId} является активным помощником`);
      return 0;
    }
  } catch (error) {
    console.error('Неожиданная ошибка при проверке статуса помощника в БД:', error);
    return 0;
  }
}

