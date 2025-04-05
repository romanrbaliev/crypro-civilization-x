
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';

/**
 * Проверяет реферальную информацию пользователя
 */
export const checkReferralInfo = async (referralCode?: string): Promise<{
  validCode: boolean;
  isReferred: boolean;
  referrerCode?: string;
}> => {
  try {
    const userId = await getUserIdentifier();
    
    // Значения по умолчанию
    const defaultResult = {
      validCode: false,
      isReferred: false
    };
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для проверки реферала');
      return defaultResult;
    }
    
    // Если передан код, проверяем его валидность
    if (referralCode) {
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', referralCode)
        .single();
      
      if (codeError || !codeData) {
        console.warn('⚠️ Невалидный реферальный код:', referralCode);
        return defaultResult;
      }
      
      // Код действителен
      defaultResult.validCode = true;
    }
    
    // Проверяем, был ли пользователь приглашен
    const { data: referralData, error: referralError } = await supabase
      .from('referral_data')
      .select('referred_by')
      .eq('user_id', userId)
      .single();
    
    if (referralError || !referralData) {
      console.log('ℹ️ Пользователь не был приглашен');
      return defaultResult;
    }
    
    // Пользователь был приглашен
    return {
      validCode: defaultResult.validCode,
      isReferred: true,
      referrerCode: referralData.referred_by
    };
    
  } catch (error) {
    console.error('❌ Ошибка при проверке реферальной информации:', error);
    return {
      validCode: false,
      isReferred: false
    };
  }
};
