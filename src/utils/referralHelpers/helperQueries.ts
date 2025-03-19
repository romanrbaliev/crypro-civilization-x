
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/api/userIdentification";
import { REFERRAL_HELPERS_TABLE } from "@/api/apiTypes";

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
 * Функция для проверки статуса помощника в базе данных
 * @param userId ID пользователя
 * @returns Promise с количеством зданий, на которых пользователь является помощником
 */
export const getHelperBuildingsFromDB = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  
  try {
    console.log(`Проверка статуса помощника в БД для ${userId}...`);
    
    // Запрашиваем данные о помощниках напрямую из таблицы
    const { data, error } = await supabase
      .from(REFERRAL_HELPERS_TABLE)
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
};
