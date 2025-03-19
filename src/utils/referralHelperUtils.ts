
import { ReferralHelper } from "@/context/types";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/api/userIdentification";
import { REFERRAL_HELPERS_TABLE } from "@/api/apiTypes";

/**
 * Проверяет, нанят ли реферал на определенное здание
 * @param userId ID пользователя (user_id)
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns true, если реферал нанят на указанное здание
 */
export const isReferralHiredForBuilding = (
  userId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): boolean => {
  const result = referralHelpers.some(
    helper => 
      helper.helperId === userId && 
      helper.buildingId === buildingId && 
      helper.status === 'accepted'
  );
  
  console.log(`Проверка назначения реферала ${userId} на здание ${buildingId}:`, result);
  return result;
};

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
  }
  
  return result;
};

/**
 * Асинхронно проверяет в базе данных, является ли пользователь помощником
 * @param userId ID пользователя
 * @returns Promise, который разрешается в true, если пользователь помощник
 */
export const checkHelperStatusInDBAsync = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log(`Асинхронная проверка статуса помощника в БД для ${userId}...`);
    
    // Проверяем соединение с базой данных
    const { data: connectionCheck, error: connectionError } = await supabase
      .from('referral_data')
      .select('user_id')
      .limit(1);
    
    if (connectionError) {
      console.error('Ошибка при проверке соединения с Supabase:', connectionError);
      return false;
    }
    
    // Запрашиваем записи, где пользователь является помощником
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('id, status, building_id')
      .eq('helper_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Ошибка при проверке статуса помощника в БД:', error);
      return false;
    }
    
    const isHelper = data && data.length > 0;
    console.log(`Результат проверки в БД для ${userId}: ${isHelper ? 'является помощником' : 'не является помощником'}`);
    console.log(`Данные из БД:`, data);
    
    return isHelper;
  } catch (error) {
    console.error('Неожиданная ошибка при проверке статуса помощника в БД:', error);
    return false;
  }
};

/**
 * Получает ID здания, на которое нанят реферал
 * @param userId ID пользователя (user_id)
 * @param referralHelpers Список помощников
 * @returns ID здания или null, если реферал не нанят
 */
export const getReferralAssignedBuildingId = (
  userId: string,
  referralHelpers: ReferralHelper[]
): string | null => {
  const helper = referralHelpers.find(
    h => h.helperId === userId && h.status === 'accepted'
  );
  
  const result = helper ? helper.buildingId : null;
  console.log(`Получение ID здания для реферала ${userId}:`, result);
  
  if (!result) {
    // Если в локальном состоянии нет информации, проверяем в БД
    getBuildingIdFromDBAsync(userId).then(buildingIdFromDB => {
      if (buildingIdFromDB) {
        console.log(`В БД найдено здание ${buildingIdFromDB} для помощника ${userId}, но отсутствует в локальном состоянии`);
        
        // Отправляем событие для обновления
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }, 500);
      }
    });
  }
  
  return result;
};

/**
 * Асинхронно получает ID здания из БД, на котором пользователь является помощником
 * @param userId ID пользователя
 * @returns Promise с ID здания или null
 */
export const getBuildingIdFromDBAsync = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    console.log(`Запрос здания из БД для помощника ${userId}...`);
    
    // Запрашиваем записи, где пользователь является помощником
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('building_id')
      .eq('helper_id', userId)
      .eq('status', 'accepted')
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Ошибка "нет данных" - не является ошибкой в нашем случае
        console.log(`В БД не найдено зданий для помощника ${userId}`);
        return null;
      }
      console.error('Ошибка при запросе здания из БД:', error);
      return null;
    }
    
    console.log(`Найдено здание в БД для помощника ${userId}:`, data?.building_id);
    return data?.building_id || null;
  } catch (error) {
    console.error('Неожиданная ошибка при запросе здания из БД:', error);
    return null;
  }
};

/**
 * Рассчитывает бонус от помощника для определенного здания
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns Процентный бонус от 0 до 1 (например, 0.2 = +20%)
 */
export const calculateBuildingBoostFromHelpers = (
  buildingId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем количество принятых помощников для этого здания
  const acceptedHelpersCount = referralHelpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  ).length;
  
  // Каждый помощник дает бонус в 5% реферреру
  const boost = acceptedHelpersCount * 0.05;
  console.log(`Бонус от помощников для здания ${buildingId}: ${boost * 100}% (${acceptedHelpersCount} помощников)`);
  return boost;
};

/**
 * Ищет запрос на трудоустройство для указанных реферала и здания
 * @param userId ID пользователя (user_id)
 * @param buildingId ID здания
 * @param referralHelpers Список помощников
 * @returns Объект запроса или null
 */
export const findHelperRequest = (
  userId: string,
  buildingId: string,
  referralHelpers: ReferralHelper[]
): ReferralHelper | null => {
  return referralHelpers.find(
    h => h.helperId === userId && h.buildingId === buildingId
  ) || null;
};

/**
 * Получает общий бонус производства для всех зданий от помощников
 * @param referralHelpers Список помощников
 * @returns Общий процентный бонус от 0 до 1
 */
export const getTotalHelperBoost = (
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем только принятых помощников
  const acceptedHelpersCount = referralHelpers.filter(
    helper => helper.status === 'accepted'
  ).length;
  
  // Каждый помощник дает бонус в 5% к реферреру
  const totalBoost = acceptedHelpersCount * 0.05;
  console.log(`Общий бонус от помощников: ${totalBoost * 100}% (${acceptedHelpersCount} принятых запросов)`);
  return totalBoost;
};

/**
 * Получает бонус производства для реферала-помощника
 * @param userId ID пользователя (user_id)
 * @param referralHelpers Список помощников
 * @returns Процентный бонус от 0 до 1
 */
export const getHelperProductionBoost = (
  userId: string,
  referralHelpers: ReferralHelper[]
): number => {
  // Считаем количество зданий, где пользователь помогает
  const acceptedBuildingsCount = referralHelpers.filter(
    helper => helper.helperId === userId && helper.status === 'accepted'
  ).length;
  
  // НОВАЯ ЛОГИКА: если в локальном состоянии нет данных о том, что пользователь является помощником,
  // проверяем в базе данных (асинхронно)
  if (acceptedBuildingsCount === 0) {
    getBuildingCountFromDBAsync(userId).then(count => {
      if (count > 0) {
        console.log(`В БД пользователь ${userId} помогает в ${count} зданиях, но в локальном состоянии это не отражено`);
        
        // Отправляем событие для обновления
        setTimeout(() => {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
        }, 500);
      }
    });
  }
  
  // Каждое здание, где реферал является помощником, дает ему бонус 10%
  const boost = acceptedBuildingsCount * 0.1;
  console.log(`Бонус для помощника ${userId}: ${boost * 100}% (помогает в ${acceptedBuildingsCount} зданиях)`);
  return boost;
};

/**
 * Асинхронно получает из БД количество зданий, на которых пользователь является помощником
 * @param userId ID пользователя
 * @returns Promise с количеством зданий
 */
export const getBuildingCountFromDBAsync = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    console.log(`Запрос количества зданий из БД для помощника ${userId}...`);
    
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
      .select('building_id')
      .eq('helper_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Ошибка при запросе количества зданий из БД:', error);
      return 0;
    }
    
    const count = data?.length || 0;
    console.log(`В БД найдено ${count} зданий для помощника ${userId}`);
    return count;
  } catch (error) {
    console.error('Неожиданная ошибка при запросе количества зданий из БД:', error);
    return 0;
  }
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
 * Получает список активных помощников для конкретного здания
 * @param buildingId ID здания
 * @param referralHelpers Список всех помощников
 * @returns Список активных помощников для данного здания
 */
export const getActiveBuildingHelpers = (
  buildingId: string,
  referralHelpers: ReferralHelper[]
): ReferralHelper[] => {
  const helpers = referralHelpers.filter(
    helper => helper.buildingId === buildingId && helper.status === 'accepted'
  );
  
  console.log(`Получено ${helpers.length} активных помощников для здания ${buildingId}`);
  return helpers;
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
