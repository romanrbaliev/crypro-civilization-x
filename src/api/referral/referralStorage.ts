
// Сервис для сохранения и получения реферальной информации

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';
import { checkSupabaseConnection } from '../connectionUtils';
import { REFERRAL_TABLE, SAVES_TABLE } from '../apiTypes';
import { ReferralDataWithActivation } from './referralTypes';

// Сохранение информации о реферале
export const saveReferralInfo = async (referralCode: string, referredBy: string | null = null): Promise<boolean> => {
  try {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при сохранении реферальной информации');
      return false;
    }
    
    const userId = await getUserIdentifier();
    console.log('Сохранение реферального кода:', referralCode, 'для пользователя:', userId, 'приглашен:', referredBy);
    
    console.log('Тип userId:', typeof userId, 'Значение:', userId);
    if (referredBy) {
      console.log('Тип referredBy:', typeof referredBy, 'Значение:', referredBy);
    }
    
    const { data: existingData, error: checkError } = await supabase
      .from(REFERRAL_TABLE)
      .select()
      .eq('user_id', userId)
      .single();
      
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('Запись не найдена, будет создана новая');
      } else {
        console.error('❌ Ошибка при проверке существующей записи:', checkError);
      }
    }
    
    if (existingData) {
      console.log('✅ Запись о реферале уже существует для пользователя', userId);
      
      if (referredBy && !existingData.referred_by) {
        const { error: updateError } = await supabase
          .from(REFERRAL_TABLE)
          .update({ referred_by: referredBy })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('❌ Ошибка при обновлении информации о реферале:', updateError);
        } else {
          console.log('✅ Обновлена информация о пригласившем пользователе:', referredBy);
          
          await updateReferrerData(referredBy, userId);
        }
      }
      
      return true;
    }
    
    const insertData = {
      user_id: userId,
      referral_code: referralCode,
      referred_by: referredBy,
      is_activated: false
    } as any;
    
    console.log('Пытаемся создать новую запись в referral_data:', insertData);
    
    const { error } = await supabase
      .from(REFERRAL_TABLE)
      .insert(insertData);
    
    if (error) {
      console.error('❌ Ошибка при сохранении информации о реферале:', error);
      return false;
    }
    
    console.log('✅ Информация о реферале сохранена успешно');
    
    if (referredBy) {
      await updateReferrerData(referredBy, userId);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при работе с реферальной информацией:', error);
    return false;
  }
};

// Вспомогательная функция для обновления данных пригласившего пользователя
async function updateReferrerData(referralCode: string, newReferralId: string): Promise<void> {
  try {
    const { data: referrer } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('referral_code', referralCode)
      .single();
    
    if (referrer) {
      console.log('✅ Найден пригласивший пользователь:', referrer.user_id);
      
      const { data: saveData } = await supabase
        .from(SAVES_TABLE)
        .select('game_data')
        .eq('user_id', referrer.user_id)
        .single();
        
      if (saveData && saveData.game_data) {
        const gameData = saveData.game_data as any;
        
        const newReferral = {
          id: newReferralId,
          username: `Пользователь ${newReferralId.substring(0, 6)}`,
          activated: false,
          joinedAt: Date.now()
        };
        
        console.log('Добавление реферала с явным статусом активации (false):', newReferral);
        
        const updatedReferrals = gameData.referrals 
          ? [...gameData.referrals.filter((r: any) => r.id !== newReferralId), newReferral]
          : [newReferral];
          
        const updatedGameData = {
          ...gameData,
          referrals: updatedReferrals
        };
        
        const { error: updateError } = await supabase
          .from(SAVES_TABLE)
          .update({ game_data: updatedGameData })
          .eq('user_id', referrer.user_id);
          
        if (updateError) {
          console.error('❌ Ошибка при обновлении списка рефералов у пригласившего:', updateError);
        } else {
          console.log('✅ Реферал добавлен в список у пригласившего пользователя:', referrer.user_id);
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при обновлении данных реферера:', error);
  }
}

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

// Проверка и обновление реферальной информации при запуске
export const checkReferralInfo = async (referralCode: string, referredBy: string | null): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    const { data: existingData } = await supabase
      .from(REFERRAL_TABLE)
      .select()
      .eq('user_id', userId)
      .single();
    
    if (existingData) {
      console.log('✅ Реферальная информация уже существует для пользователя', userId);
      return;
    }
    
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
