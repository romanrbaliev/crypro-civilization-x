
// Новый файл, объединяющий операции с рефералами

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { checkSupabaseConnection } from './connectionUtils';
import { REFERRAL_TABLE, SAVES_TABLE } from './apiTypes';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

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
          hired: false,
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
    
    const activationData = activationCheck as unknown as any;
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
        activated: true,
        hired: false,
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
          activated: true,
          hired: false,
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
          activated: true,
          hired: referral.hired || false
        };
      }
      
      console.log('Обновленные рефералы после активации:', 
        gameData.referrals.map((r: any) => ({ id: r.id, activated: r.activated, hired: r.hired }))
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

// Получение списка рефералов для текущего пользователя
export const getUserReferrals = async (): Promise<any[]> => {
  try {
    const userId = await getUserIdentifier();
    
    // Проверяем, есть ли у пользователя реферальный код
    const { data: referralData, error: referralError } = await supabase
      .from(REFERRAL_TABLE)
      .select('referral_code')
      .eq('user_id', userId)
      .single();
      
    if (referralError || !referralData) {
      console.error('❌ Не удалось получить реферальный код пользователя:', referralError);
      return [];
    }
    
    const referralCode = referralData.referral_code;
    
    // Получаем список пользователей, которые указали наш код при регистрации
    const { data: referralsData, error: referralsError } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id, is_activated')
      .eq('referred_by', referralCode);
      
    if (referralsError) {
      console.error('❌ Ошибка при получении списка рефералов:', referralsError);
      return [];
    }
    
    if (!referralsData || referralsData.length === 0) {
      console.log('У пользователя нет рефералов');
      return [];
    }
    
    console.log(`Найдено ${referralsData.length} рефералов для пользователя ${userId}`);
    
    // Преобразуем данные в нужный формат
    return referralsData.map(referral => ({
      id: referral.user_id,
      username: `Пользователь ${referral.user_id.substring(0, 6)}`,
      activated: referral.is_activated === true,
      joinedAt: Date.now() // Временная заглушка
    }));
  } catch (error) {
    console.error('❌ Ошибка при получении списка рефералов:', error);
    return [];
  }
};

// Обновление статуса реферала (нанят/уволен)
export const updateReferralHiredStatus = async (
  referralId: string,
  hired: boolean,
  buildingId: string | null = null
): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    
    // Получаем текущее сохранение игры
    const { data: saveData, error: saveError } = await supabase
      .from(SAVES_TABLE)
      .select('game_data')
      .eq('user_id', userId)
      .single();
      
    if (saveError || !saveData || !saveData.game_data) {
      console.error('❌ Ошибка при получении данных сохранения:', saveError);
      return false;
    }
    
    const gameData = saveData.game_data as any;
    
    if (!gameData.referrals) {
      console.error('❌ Нет списка рефералов в сохранении игры');
      return false;
    }
    
    // Ищем реферала в списке
    const referralIndex = gameData.referrals.findIndex((ref: any) => ref.id === referralId);
    
    if (referralIndex === -1) {
      console.error('❌ Реферал не найден в списке');
      return false;
    }
    
    // Обновляем статус реферала
    gameData.referrals[referralIndex] = {
      ...gameData.referrals[referralIndex],
      hired,
      assignedBuildingId: hired ? buildingId : null
    };
    
    console.log(`Обновлен статус реферала ${referralId}: hired=${hired}, buildingId=${buildingId}`);
    
    // Сохраняем обновленные данные
    const { error: updateError } = await supabase
      .from(SAVES_TABLE)
      .update({ game_data: gameData })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('❌ Ошибка при обновлении статуса реферала:', updateError);
      return false;
    }
    
    console.log('✅ Статус реферала успешно обновлен');
    
    // Отправляем событие для обновления UI
    setTimeout(() => {
      try {
        const updateEvent = new CustomEvent('referral-status-updated', {
          detail: { referralId, hired, buildingId }
        });
        window.dispatchEvent(updateEvent);
        console.log(`Отправлено событие обновления статуса реферала ${referralId}`);
      } catch (error) {
        console.error('❌ Ошибка при отправке события обновления статуса реферала:', error);
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при обновлении статуса реферала:', error);
    return false;
  }
};
