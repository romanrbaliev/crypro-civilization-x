
import { ReferralHelper } from "@/context/types";
import { supabase } from "@/integrations/supabase/client";
import { REFERRAL_HELPERS_TABLE } from "@/api/apiTypes";

/**
 * Проверяет, нанят ли реферал на любое здание
 * @param userId ID пользователя (user_id)
 * @param referralHelpers Список помощников
 * @returns true, если реферал нанят хотя бы на одно здание
 */
export const isReferralHired = (
  userId: string,
  referralHelpers: ReferralHelper[]
): boolean => {
  const result = referralHelpers.some(
    helper => helper.helperId === userId && helper.status === 'accepted'
  );
  
  console.log(`Проверка найма реферала ${userId} в локальном состоянии:`, result);
  
  if (!result) {
    // Если в локальном состоянии нет информации о найме,
    // запускаем асинхронную проверку в БД
    import('./helperQueries').then(({ checkHelperStatusInDBAsync }) => {
      checkHelperStatusInDBAsync(userId).then(hasHelperRoleInDB => {
        if (hasHelperRoleInDB) {
          console.log(`Обнаружено расхождение: пользователь ${userId} является помощником в БД, но не в локальном состоянии`);
          
          // Отправляем событие для обновления
          setTimeout(() => {
            const refreshEvent = new CustomEvent('refresh-referrals');
            window.dispatchEvent(refreshEvent);
          }, 500);
        }
      });
    });
  }
  
  return result;
};

/**
 * Получает список принятых помощников для конкретного пользователя
 * @param referralHelpers Список всех помощников
 * @param userId ID пользователя (user_id)
 * @returns Список принятых запросов помощи
 */
export const getAcceptedHelperRequests = (
  referralHelpers: ReferralHelper[],
  userId: string
): ReferralHelper[] => {
  return referralHelpers.filter(
    helper => helper.helperId === userId && helper.status === 'accepted'
  );
};

/**
 * Проверяет, есть ли у пользователя активные помощники
 * @param referralHelpers Список всех помощников
 * @returns true, если есть хотя бы один принятый запрос
 */
export const hasActiveHelpers = (
  referralHelpers: ReferralHelper[]
): boolean => {
  const activeCount = referralHelpers.filter(helper => helper.status === 'accepted').length;
  console.log(`Проверка наличия активных помощников: ${activeCount} из ${referralHelpers.length}`);
  
  // Добавляем детальное логирование для отладки
  if (referralHelpers.length > 0) {
    console.log(`Обзор всех помощников в системе:`);
    referralHelpers.forEach((helper, index) => {
      console.log(`Помощник #${index + 1}: ID=${helper.helperId}, здание=${helper.buildingId}, статус=${helper.status}`);
    });
  }
  
  return activeCount > 0;
};

/**
 * Получает подробную информацию о состоянии помощников
 * @param referralHelpers Список всех помощников
 * @returns Объект с подробной информацией по статусам
 */
export const getHelperStatusSummary = (
  referralHelpers: ReferralHelper[]
): { accepted: number, pending: number, rejected: number, total: number, buildings: {[key: string]: number} } => {
  const accepted = referralHelpers.filter(h => h.status === 'accepted').length;
  const pending = referralHelpers.filter(h => h.status === 'pending').length;
  const rejected = referralHelpers.filter(h => h.status === 'rejected').length;
  
  // Подсчитываем количество помощников по зданиям
  const buildings: {[key: string]: number} = {};
  referralHelpers
    .filter(h => h.status === 'accepted')
    .forEach(h => {
      buildings[h.buildingId] = (buildings[h.buildingId] || 0) + 1;
    });
  
  return {
    accepted,
    pending,
    rejected,
    total: referralHelpers.length,
    buildings
  };
};

/**
 * Синхронизирует статусы помощников с базой данных Supabase
 * @param referralHelpers Текущий список помощников в локальном состоянии
 * @returns Промис с обновленным списком помощников или null в случае ошибки
 */
export const syncHelperStatusWithDB = async (
  referralHelpers: ReferralHelper[]
): Promise<ReferralHelper[] | null> => {
  try {
    // Получаем ID текущего пользователя
    const { getUserIdentifier } = await import('@/api/userIdentification');
    const userId = await getUserIdentifier();
    if (!userId) {
      console.error('Не удалось получить ID пользователя для синхронизации помощников');
      return null;
    }
    
    console.log('Синхронизация помощников с базой данных для пользователя:', userId);
    window.__game_user_id = userId; // Кэшируем ID пользователя
    
    // Сначала проверяем, является ли пользователь помощником в БД
    const { data: helperData, error: helperError } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('*')
      .eq('helper_id', userId)
      .eq('status', 'accepted');
    
    if (helperError) {
      console.error('Ошибка при проверке статуса помощника в БД:', helperError);
    } else if (helperData && helperData.length > 0) {
      console.log(`Пользователь ${userId} является помощником в ${helperData.length} зданиях по данным БД:`, helperData);
      
      // Проверяем, отражено ли это в локальном состоянии
      const localHelpers = referralHelpers.filter(h => h.helperId === userId && h.status === 'accepted');
      
      if (localHelpers.length !== helperData.length) {
        console.log(`Обнаружено расхождение: в БД ${helperData.length} зданий, в локальном состоянии ${localHelpers.length}`);
        
        // Отправляем событие для обновления
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }, 500);
      }
    }
    
    // Затем получаем данные о всех помощниках для работодателя
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('id, helper_id, building_id, status')
      .eq('employer_id', userId);
    
    if (error) {
      console.error('Ошибка при получении данных о помощниках из базы данных:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('В базе данных нет информации о помощниках для работодателя', userId);
      return null;
    }
    
    console.log('Получены данные о помощниках из БД:', data);
    
    // Создаем карту соответствия ID помощников и зданий для быстрого поиска
    const dbHelpersMap = new Map();
    data.forEach(helper => {
      const key = `${helper.helper_id}_${helper.building_id}`;
      dbHelpersMap.set(key, {
        id: helper.id.toString(),
        helperId: helper.helper_id,
        buildingId: helper.building_id,
        status: helper.status,
        createdAt: Date.now()
      });
    });
    
    // Обновляем локальные данные на основе данных из БД
    const updatedHelpers = referralHelpers.map(helper => {
      const key = `${helper.helperId}_${helper.buildingId}`;
      const dbHelper = dbHelpersMap.get(key);
      
      if (dbHelper && dbHelper.status !== helper.status) {
        console.log(`Обновление статуса помощника ${helper.helperId} для здания ${helper.buildingId}: ${helper.status} -> ${dbHelper.status}`);
        return { ...helper, status: dbHelper.status as 'pending' | 'accepted' | 'rejected' };
      }
      
      return helper;
    });
    
    // Логируем обновленные данные для отладки
    console.log('Результат синхронизации помощников:', updatedHelpers);
    
    return updatedHelpers;
  } catch (error) {
    console.error('Ошибка при синхронизации помощников с базой данных:', error);
    return null;
  }
};
