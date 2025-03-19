
// Сервис для получения данных о рефералах

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';
import { REFERRAL_TABLE } from '../apiTypes';
import { ReferralDataWithActivation } from './referralTypes';

// Получение рефералов пользователя
export const getUserReferrals = async (): Promise<any[]> => {
  try {
    const userId = await getUserIdentifier();
    console.log('Получение рефералов для пользователя:', userId);
    
    const userReferralCode = await getUserReferralCode(userId);
    
    if (!userReferralCode) {
      console.warn('⚠️ Не удалось получить реферальный код пользователя');
      return [];
    }
    
    // Проверяем соединение с базой данных
    const { data: connectionTest, error: connectionError } = await supabase
      .from(REFERRAL_TABLE)
      .select('count(*)');
      
    if (connectionError) {
      console.error('❌ Ошибка соединения с базой данных:', connectionError);
      return [];
    }
    
    console.log('✅ Соединение с базой данных подтверждено');
    
    // Получаем только реальные данные из базы данных
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id, created_at, is_activated')
      .eq('referred_by', userReferralCode);
    
    if (error) {
      console.error('❌ Ошибка при получении списка рефералов:', error);
      return [];
    }
    
    console.log(`✅ Получено ${data?.length || 0} рефералов из базы данных:`, data);
    
    // Дополнительная проверка на валидность данных
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ Данные о рефералах отсутствуют или имеют неверный формат');
      return [];
    }
    
    // Получаем данные о помощниках для определения, назначены ли рефералы на здания
    const { data: helpersData, error: helpersError } = await supabase
      .from('referral_helpers')
      .select('helper_id, building_id, status')
      .eq('employer_id', userId)
      .eq('status', 'accepted');
      
    if (helpersError) {
      console.error('❌ Ошибка при получении данных о помощниках:', helpersError);
    }
    
    const activeHelpers = helpersData || [];
    console.log('Активные помощники:', activeHelpers);
    
    const referrals = (data || []).map(referral => {
      // Проверяем статус помощника
      const helperInfo = activeHelpers.find(h => h.helper_id === referral.user_id);
      const isHired = Boolean(helperInfo);
      const assignedBuildingId = helperInfo ? helperInfo.building_id : undefined;
      
      const activated = referral.is_activated === true;
      
      console.log(`Обработка реферала ${referral.user_id}:`, {
        activated,
        hired: isHired,
        buildingId: assignedBuildingId
      });
      
      return {
        id: referral.user_id, // Используем user_id вместо referral_code
        username: `Пользователь ${referral.user_id.substring(0, 6)}`,
        activated: activated,
        hired: isHired,
        assignedBuildingId: assignedBuildingId,
        joinedAt: new Date(referral.created_at).getTime()
      };
    });
    
    console.log('Преобразованные данные рефералов:', referrals);
    return referrals;
  } catch (error) {
    console.error('❌ Ошибка при получении рефералов:', error);
    return [];
  }
};

// Получение реферального кода пользователя
export const getUserReferralCode = async (userId?: string): Promise<string | null> => {
  try {
    const userIdToUse = userId || await getUserIdentifier();
    
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('referral_code')
      .eq('user_id', userIdToUse)
      .single();
    
    if (error || !data) {
      console.warn('⚠️ Не удалось получить реферальный код:', error);
      return null;
    }
    
    return data.referral_code;
  } catch (error) {
    console.error('❌ Ошибка при получении реферального кода:', error);
    return null;
  }
};
