
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';

/**
 * Сохраняет информацию о реферале
 */
export const saveReferralInfo = async (referralCode: string): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для сохранения реферала');
      return false;
    }
    
    // Сохраняем информацию о реферале
    const { error } = await supabase
      .from('referral_data')
      .upsert({
        user_id: userId,
        referred_by: referralCode,
        created_at: new Date().toISOString(),
        is_activated: false,
        referral_code: referralCode // Добавляем обязательное поле referral_code
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('❌ Ошибка при сохранении информации о реферале:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении информации о реферале:', error);
    return false;
  }
};
