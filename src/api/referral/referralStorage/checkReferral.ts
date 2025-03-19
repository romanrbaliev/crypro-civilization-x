
import { supabase } from '@/integrations/supabase/client';
import { REFERRAL_TABLE } from '../../apiTypes';
import { saveReferralInfo } from './saveReferral';

// Проверка и обновление реферальной информации при запуске
export const checkReferralInfo = async (userId: string, referredBy: string | null): Promise<void> => {
  try {
    const { data: existingData } = await supabase
      .from(REFERRAL_TABLE)
      .select()
      .eq('user_id', userId)
      .single();
    
    if (existingData) {
      console.log('✅ Реферальная информация уже существует для пользователя', userId);
      return;
    }
    
    // Генерируем код для пользователя, если его нет
    const referralCode = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    
    await saveReferralInfo(referralCode, referredBy);
    
    if (referredBy) {
      const { data: referrerData } = await supabase
        .from(REFERRAL_TABLE)
        .select('user_id')
        .eq('referral_code', referredBy)
        .single();
        
      if (referrerData) {
        console.log('✅ Обновляем информацию о рефералах для пользователя', referrerData.user_id);
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке реферальной информации:', error);
  }
};
