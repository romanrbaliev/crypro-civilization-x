
import { ReferralHelper } from "@/context/types";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/api/userIdentification";

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
  
  console.log(`Проверка найма реферала ${userId}:`, result);
  return result;
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
  return result;
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
  
  // НОВАЯ ЛОГИКА: Теперь каждый помощник дает бонус в 5% реферреру
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
  
  // НОВАЯ ЛОГИКА: Каждый помощник дает бонус в 5% к реферреру
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
  
  // НОВАЯ ЛОГИКА: Каждое здание, где реферал является помощником, дает ему бонус 10%
  const boost = acceptedBuildingsCount * 0.1;
  console.log(`Бонус для помощника ${userId}: ${boost * 100}% (помогает в ${acceptedBuildingsCount} зданиях)`);
  return boost;
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
    
    // Получаем данные о помощниках из базы данных
    const { data, error } = await supabase
      .from('referral_helpers')
      .select('id, helper_id, building_id, status')
      .eq('employer_id', userId);
    
    if (error) {
      console.error('Ошибка при получении данных о помощниках из базы данных:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('В базе данных нет информации о помощниках');
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
        status: helper.status
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
