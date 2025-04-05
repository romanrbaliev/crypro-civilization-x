
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';

/**
 * Активирует реферала
 */
export const activateReferral = async (referralId: string): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для активации реферала');
      return false;
    }
    
    // Обновляем статус реферала
    const { error } = await supabase
      .from('referral_data')
      .update({ is_activated: true })
      .eq('user_id', referralId);
    
    if (error) {
      console.error('❌ Ошибка при активации реферала:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при активации реферала:', error);
    return false;
  }
};
