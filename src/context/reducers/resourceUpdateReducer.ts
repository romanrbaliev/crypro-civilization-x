
import { GameState } from '../types';
import { calculateResourceProduction, applyStorageBoosts, updateResourceValues } from '../utils/resourceUtils';
import { hasActiveHelpers, syncHelperStatusWithDB } from '@/utils/referralHelperUtils';
import { getUserIdentifier } from '@/api/userIdentification';
import { supabase } from '@/integrations/supabase/client';

// Функция для прямого получения актуальных данных о помощниках из базы данных
async function getActiveHelpersFromDB(userId: string): Promise<{ buildingId: string, helperId: string, status: string }[]> {
  if (!userId) return [];
  
  try {
    console.log(`Получение актуальных данных о помощниках для пользователя ${userId}...`);
    
    // Запрашиваем данные о помощниках напрямую из таблицы
    const { data, error } = await supabase
      .from('referral_helpers')
      .select('building_id, helper_id, status')
      .or(`helper_id.eq.${userId},employer_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Ошибка при получении данных о помощниках:', error);
      return [];
    }
    
    if (data && data.length > 0) {
      console.log(`Найдено ${data.length} активных записей о помощниках для пользователя ${userId}:`, data);
      
      // Преобразуем формат данных для совместимости с нашей системой
      return data.map(item => ({
        buildingId: item.building_id,
        helperId: item.helper_id,
        status: item.status
      }));
    } else {
      console.log(`Не найдено активных помощников для пользователя ${userId}`);
      return [];
    }
  } catch (error) {
    console.error('Неожиданная ошибка при получении данных о помощниках:', error);
    return [];
  }
}

// Новая функция для обновления локального состояния с учетом данных из БД
async function updateHelperStatusFromDB(state: GameState, userId: string): Promise<GameState> {
  if (!userId) return state;
  
  try {
    // Получаем актуальные данные из БД
    const activeHelpersData = await getActiveHelpersFromDB(userId);
    
    // Если нет данных из БД, возвращаем исходное состояние
    if (activeHelpersData.length === 0) {
      return state;
    }
    
    // Создаем новый массив помощников
    let updatedHelpers = [...state.referralHelpers];
    
    // Добавляем или обновляем записи из БД
    for (const helperData of activeHelpersData) {
      // Проверяем, существует ли уже запись с таким buildingId и helperId
      const existingIndex = updatedHelpers.findIndex(
        h => h.buildingId === helperData.buildingId && h.helperId === helperData.helperId
      );
      
      if (existingIndex >= 0) {
        // Обновляем существующую запись
        updatedHelpers[existingIndex] = {
          ...updatedHelpers[existingIndex],
          status: helperData.status as "accepted" | "pending" | "rejected"
        };
        console.log(`Обновлена запись о помощнике: ${helperData.helperId} для здания ${helperData.buildingId}, статус: ${helperData.status}`);
      } else {
        // Добавляем новую запись
        updatedHelpers.push({
          buildingId: helperData.buildingId,
          helperId: helperData.helperId,
          status: helperData.status as "accepted" | "pending" | "rejected",
          // Добавляем поля, которые могут потребоваться для совместимости
          id: `db-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now()
        });
        console.log(`Добавлена новая запись о помощнике: ${helperData.helperId} для здания ${helperData.buildingId}, статус: ${helperData.status}`);
      }
    }
    
    // Возвращаем обновленное состояние
    return {
      ...state,
      referralHelpers: updatedHelpers
    };
  } catch (error) {
    console.error('Ошибка при обновлении статусов помощников из БД:', error);
    return state;
  }
}

// Основная функция обработки обновления ресурсов
export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = now - state.lastUpdate;
  
  // Пытаемся получить ID пользователя сразу из кэша или localStorage
  let currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
  let referralHelperBonus = 0;
  
  // Асинхронно обновляем помощников из базы данных, но не ждем завершения
  // для синхронной работы редьюсера
  if (currentUserId) {
    // Запускаем асинхронное обновление, но не блокируем основной поток
    updateHelperStatusFromDB(state, currentUserId)
      .then((updatedState) => {
        // Если есть изменения, отправляем событие для обновления состояния
        if (updatedState.referralHelpers.length !== state.referralHelpers.length) {
          const helpersEvent = new CustomEvent('helpers-updated', {
            detail: { updatedHelpers: updatedState.referralHelpers }
          });
          window.dispatchEvent(helpersEvent);
        }
      })
      .catch(err => console.error('Ошибка при асинхронном обновлении помощников:', err));
    
    // Пока используем существующие данные для текущего расчета
    const buildingsAsHelper = state.referralHelpers.filter(h => 
      h.helperId === currentUserId && h.status === 'accepted'
    ).length;
    
    // Каждое здание, на котором пользователь помогает, дает ему бонус 10%
    referralHelperBonus = buildingsAsHelper * 0.1; // 10% за каждое здание
    
    if (buildingsAsHelper > 0) {
      console.log(`Пользователь ${currentUserId} помогает на ${buildingsAsHelper} зданиях, бонус: +${referralHelperBonus * 100}%`);
    } else {
      console.log(`В локальном состоянии пользователь ${currentUserId} не является помощником ни для одного здания`);
      
      // Проверяем напрямую в базе данных, возможно данные не синхронизированы
      checkHelperStatusInDB(currentUserId).then(helperBuildingsCount => {
        if (helperBuildingsCount > 0) {
          console.log(`БД подтверждает: пользователь ${currentUserId} помогает на ${helperBuildingsCount} зданиях, но локальное состояние не обновлено`);
          
          // Принудительно запрашиваем полное обновление помощников из БД
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }
      });
    }
  } else {
    // Пытаемся получить ID пользователя
    getUserIdentifier()
      .then(userId => {
        if (userId) {
          window.__game_user_id = userId;
          localStorage.setItem('crypto_civ_user_id', userId);
          
          // Проверяем пользователя
          checkHelperStatusInDB(userId).then(helperBuildingsCount => {
            if (helperBuildingsCount > 0) {
              // Запрашиваем обновление
              setTimeout(() => {
                const events = [
                  new CustomEvent('force-resource-update'),
                  new CustomEvent('refresh-referrals')
                ];
                events.forEach(e => window.dispatchEvent(e));
              }, 100);
            }
          });
        }
      })
      .catch(err => console.error('Ошибка при получении ID пользователя:', err));
  }
  
  // Синхронизируем статусы помощников с базой данных
  if (state.referralHelpers.length > 0 && currentUserId) {
    syncHelperStatusWithDB(state.referralHelpers)
      .then(updatedHelpers => {
        if (updatedHelpers && updatedHelpers.length > 0) {
          const updateEvent = new CustomEvent('helpers-updated', {
            detail: { updatedHelpers }
          });
          window.dispatchEvent(updateEvent);
        }
      })
      .catch(err => console.error('Ошибка при синхронизации помощников:', err));
  }
  
  // Рассчитываем производство ресурсов
  let updatedResources = calculateResourceProduction(
    state.resources, 
    state.buildings, 
    state.referralHelpers,
    state.referrals,
    currentUserId,
    referralHelperBonus
  );
  
  // Применяем увеличение хранилища
  updatedResources = applyStorageBoosts(updatedResources, state.buildings);
  
  // Применяем эффекты от исследований
  Object.values(state.upgrades).forEach(upgrade => {
    if (upgrade.purchased) {
      const effects = upgrade.effects || upgrade.effect || {};
      
      Object.entries(effects).forEach(([effectId, amount]) => {
        if (effectId === 'knowledgeBoost' && updatedResources.knowledge) {
          const boost = Number(amount);
          const baseProduction = updatedResources.knowledge.baseProduction || 0;
          const boostAmount = baseProduction * boost;
          
          updatedResources.knowledge.perSecond += boostAmount;
          updatedResources.knowledge.production += boostAmount;
        }
        else if (effectId.includes('Boost') && !effectId.includes('Max')) {
          const resourceId = effectId.replace('Boost', '');
          if (updatedResources[resourceId]) {
            const boost = Number(amount);
            const baseProduction = updatedResources[resourceId].baseProduction || 0;
            const boostAmount = baseProduction * boost;
            
            updatedResources[resourceId].perSecond += boostAmount;
            updatedResources[resourceId].production += boostAmount;
          }
        }
      });
    }
  });
  
  // Обновляем значения ресурсов
  updatedResources = updateResourceValues(updatedResources, deltaTime);
  
  // Логирование для отладки
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

// Функция для проверки статуса помощника в базе данных
async function checkHelperStatusInDB(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    console.log(`Проверка статуса помощника напрямую в БД для ${userId}...`);
    
    // Проверка соединения с Supabase
    const { data: connectionCheck, error: connectionError } = await supabase
      .from('referral_data')
      .select('user_id')
      .limit(1);
    
    if (connectionError) {
      console.error('Ошибка при проверке соединения с Supabase:', connectionError);
      return 0;
    }
    
    // Запрос данных о помощниках
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
