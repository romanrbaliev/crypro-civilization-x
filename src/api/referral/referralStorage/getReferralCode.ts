
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../../userIdentification';
import { REFERRAL_TABLE } from '../../apiTypes';

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
