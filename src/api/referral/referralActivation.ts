
// Сервис для активации рефералов

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '../userIdentification';
import { checkSupabaseConnection } from '../connectionUtils';
import { REFERRAL_TABLE, SAVES_TABLE } from '../apiTypes';
import { ReferralDataWithActivation } from './referralTypes';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Активация реферала (когда реферал разблокирует исследование "Основы блокчейна")
export const activateReferral = async (referralId: string): Promise<boolean> => {
  try {
    console.log('🔄 Активация реферала с ID:', referralId);
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Ошибка соединения с Supabase при активации реферала');
      return false;
    }
    
    const userId = await getUserIdentifier();
    console.log('Активация выполняется пользователем:', userId);
    
    const { data: referralExists, error: referralExistsError } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('user_id', referralId)
      .single();
      
    if (referralExistsError || !referralExists) {
      console.error('❌ Не найден реферал с ID:', referralId);
      console.log('Попробуем использовать текущий ID пользователя для активации');
      referralId = userId;
    }
    
    // Проверяем текущий статус активации
    const { data: activationCheck, error: checkError } = await supabase
      .from(REFERRAL_TABLE)
      .select('*')
      .eq('user_id', referralId)
      .single();
    
    if (checkError) {
      console.error('❌ Ошибка при проверке активации реферала:', checkError);
      return false;
    }
    
    const activationData = activationCheck as unknown as ReferralDataWithActivation;
    const isAlreadyActivated = activationData && activationData.is_activated === true;
    
    console.log(`Текущий статус активации реферала ${referralId} в базе данных: ${isAlreadyActivated ? 'активирован' : 'не активирован'}`);
    
    if (isAlreadyActivated) {
      console.log('⚠️ Реферал уже активирован в базе данных');
      return true;
    }
    
    // Получаем информацию о реферере
    const { data: userData, error: userError } = await supabase
      .from(REFERRAL_TABLE)
      .select('referred_by')
      .eq('user_id', referralId)
      .single();
      
    if (userError) {
      console.error('❌ Ошибка при получении данных о пользователе:', userError);
      return false;
    }
      
    if (!userData || !userData.referred_by) {
      console.warn('⚠️ Нет информации о том, кто пригласил пользователя. userData:', userData);
      return false;
    }
    
    console.log('Получен код пригласившего:', userData.referred_by);
    
    // Получаем данные о пригласившем пользователе
    const { data: referrerData, error: referrerError } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('referral_code', userData.referred_by)
      .single();
      
    if (referrerError) {
      console.error('❌ Ошибка при получении данных о пригласившем:', referrerError);
      return false;
    }
      
    if (!referrerData) {
      console.warn('⚠️ Не найден пользователь с реферальным кодом', userData.referred_by);
      return false;
    }
    
    console.log('✅ Найден пригласивший пользователь:', referrerData.user_id);
    
    // Получаем сохранение игры пригласившего
    const { data: saveData, error: saveError } = await supabase
      .from(SAVES_TABLE)
      .select('game_data')
      .eq('user_id', referrerData.user_id)
      .single();
      
    if (saveError) {
      console.error('❌ Ошибка при получении данных сохранения:', saveError);
      return false;
    }
      
    if (!saveData || !saveData.game_data) {
      console.warn('⚠️ Не найдено сохранение игры для пользователя', referrerData.user_id);
      return false;
    }
    
    // Обновляем статус активации в таблице referral_data
    const { error: updateReferralError } = await supabase
      .from(REFERRAL_TABLE)
      .update({ is_activated: true })
      .eq('user_id', referralId);
      
    if (updateReferralError) {
      console.error('❌ Ошибка при обновлении статуса активации реферала в БД:', updateReferralError);
      return false;
    }
    
    console.log('✅ Обновлен статус активации реферала в базе данных для', referralId);
    
    // Обновляем статус в сохранении игры
    return await updateReferralStatusInGameSave(referralId, saveData.game_data, referrerData.user_id);
  } catch (error) {
    console.error('❌ Ошибка при активации реферала:', error);
    return false;
  }
};

// Вспомогательная функция для обновления статуса реферала в сохранении игры
async function updateReferralStatusInGameSave(
  referralId: string, 
  gameData: any, 
  referrerUserId: string
): Promise<boolean> {
  try {
    if (!gameData.referrals) {
      gameData.referrals = [{
        id: referralId,
        username: `Пользователь ${referralId.substring(0, 6)}`,
        activated: true,  // Явно указываем boolean тип
        joinedAt: Date.now()
      }];
      
      console.log('Создан новый массив рефералов:', gameData.referrals);
      
      const { error: updateError } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: gameData })
        .eq('user_id', referrerUserId);
        
      if (updateError) {
        console.error('❌ Ошибка при создании списка рефералов:', updateError);
        return false;
      }
      
      console.log('✅ Создан список рефералов и активирован реферал');
      
      safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
      
      return true;
    } else {
      const referralIndex = gameData.referrals.findIndex((ref: any) => ref.id === referralId);
      
      if (referralIndex === -1) {
        console.log('⚠️ Реферал с ID', referralId, 'не найден в списке рефералов, добавляем новый');
        
        const newReferral = {
          id: referralId,
          username: `Пользователь ${referralId.substring(0, 6)}`,
          activated: true,  // Явно указываем boolean тип
          joinedAt: Date.now()
        };
        
        console.log('Добавляем и активируем нового реферала:', newReferral);
        
        gameData.referrals.push(newReferral);
      } else {
        const referral = gameData.referrals[referralIndex];
        
        if (referral.activated === true) {
          console.log('⚠️ Реферал уже активирован в сохранении игры');
          return true;
        }
        
        console.log('Активируем существующего реферала. Статус до:', referral.activated);
        
        gameData.referrals[referralIndex] = {
          ...referral,
          activated: true  // Явно указываем boolean тип
        };
      }
      
      console.log('Обновленные рефералы после активации:', 
        gameData.referrals.map((r: any) => ({ id: r.id, activated: r.activated }))
      );
      
      const { error: updateError } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: gameData })
        .eq('user_id', referrerUserId);
      
      if (updateError) {
        console.error('❌ Ошибка при обновлении списка рефералов:', updateError);
        return false;
      }
      
      console.log('✅ Реферал успешно активирован в сохранении игры');
      
      safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
      
      // Отправляем событие для обновления UI
      setTimeout(() => {
        try {
          const refreshEvent = new CustomEvent('refresh-referrals');
          window.dispatchEvent(refreshEvent);
          console.log(`Отправлено событие обновления для всех рефералов`);
        } catch (error) {
          console.error(`Ошибка при отправке события обновления рефералов:`, error);
        }
      }, 500);
      
      return true;
    }
  } catch (error) {
    console.error('❌ Ошибка при обновлении статуса реферала в сохранении:', error);
    return false;
  }
}
