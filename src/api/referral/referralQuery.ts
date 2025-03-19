
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
    
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('*')
      .eq('referred_by', userReferralCode);
    
    if (error) {
      console.error('❌ Ошибка при получении списка рефералов:', error);
      return [];
    }
    
    console.log(`✅ Получено ${data?.length || 0} рефералов из базы данных:`, data);
    
    const referrals = (data || []).map(referral => {
      const referralData = referral as unknown as ReferralDataWithActivation;
      
      let activated = false;
      
      if (typeof referralData.is_activated === 'boolean') {
        activated = referralData.is_activated;
        console.log(`Реферал ${referral.user_id} имеет статус активации:`, activated);
      } else {
        console.log(`Реферал ${referral.user_id} имеет неопределенный статус активации, устанавливаем false`);
      }
      
      return {
        id: referral.user_id,
        username: `Пользователь ${referral.user_id.substring(0, 6)}`,
        activated: activated,
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
