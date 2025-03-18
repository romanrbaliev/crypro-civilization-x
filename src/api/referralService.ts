// Сервис для работы с реферальной системой

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { checkSupabaseConnection } from './connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { REFERRAL_TABLE, SAVES_TABLE } from './apiTypes';

// Сохранение информации о реферале
export const saveReferralInfo = async (referralCode: string, referredBy: string | null = null): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log('Сохранение реферального кода:', referralCode, 'для пользователя:', userId, 'приглашен:', referredBy);
    
    // Обновлены логи для лучшего понимания процесса сохранения
    console.log('Тип userId:', typeof userId, 'Значение:', userId);
    if (referredBy) {
      console.log('Тип referredBy:', typeof referredBy, 'Значение:', referredBy);
    }
    
    // Проверяем наличие записи для этого пользователя
    const { data: existingData, error: checkError } = await supabase
      .from(REFERRAL_TABLE)
      .select()
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Ошибка при проверке существующей записи:', checkError);
    }
    
    if (existingData) {
      console.log('✅ Запись о реферале уже существует для пользователя', userId);
      
      // Если запись существует, но параметр referredBy новый и не был установлен ранее, обновляем запись
      if (referredBy && !existingData.referred_by) {
        const { error: updateError } = await supabase
          .from(REFERRAL_TABLE)
          .update({ referred_by: referredBy })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('❌ Ошибка при обновлении информации о реферале:', updateError);
        } else {
          console.log('✅ Обновлена информация о пригласившем пользователе:', referredBy);
          
          // Добавлен вывод данных реферала в лог для отладки
          const { data: referrerData } = await supabase
            .from(REFERRAL_TABLE)
            .select('user_id')
            .eq('referral_code', referredBy)
            .single();
            
          console.log('Данные пригласившего:', referrerData);
            
          if (referrerData) {
            // Получаем сохранение игры пригласившего
            const { data: saveData } = await supabase
              .from(SAVES_TABLE)
              .select('game_data')
              .eq('user_id', referrerData.user_id)
              .single();
              
            if (saveData && saveData.game_data) {
              // Добавляем нового реферала в список пригласившего
              const gameData = saveData.game_data as any;
              
              // Всегда устанавливаем activated: false для нового реферала
              const newReferral = {
                id: userId,
                username: `Пользователь ${userId.substring(0, 6)}`,
                activated: false,
                joinedAt: Date.now()
              };
              
              console.log('Добавление реферала с явным статусом активации (false):', newReferral);
              
              const updatedReferrals = gameData.referrals 
                ? [...gameData.referrals.filter((r: any) => r.id !== userId), newReferral]
                : [newReferral];
                
              const updatedGameData = {
                ...gameData,
                referrals: updatedReferrals
              };
              
              // Обновляем сохранение пригласившего
              const { error: updateSaveError } = await supabase
                .from(SAVES_TABLE)
                .update({ game_data: updatedGameData })
                .eq('user_id', referrerData.user_id);
                
              if (updateSaveError) {
                console.error('❌ Ошибка при обновлении списка рефералов у пригласившего:', updateSaveError);
              } else {
                console.log('✅ Реферал добавлен в список у пригласившего пользователя:', referrerData.user_id);
              }
            }
          }
        }
      }
      
      return true;
    }
    
    // Создаем новую запись
    const { error } = await supabase
      .from(REFERRAL_TABLE)
      .insert({
        user_id: userId,
        referral_code: referralCode,
        referred_by: referredBy
      });
    
    if (error) {
      console.error('❌ Ошибка при сохранении информации о реферале:', error);
      return false;
    }
    
    console.log('✅ Информация о реферале сохранена успешно');
    
    // Если есть информация о том, кто пригласил пользователя
    if (referredBy) {
      // Проверяем существование пользователя, который пригласил
      const { data: referrer } = await supabase
        .from(REFERRAL_TABLE)
        .select('user_id')
        .eq('referral_code', referredBy)
        .single();
      
      if (referrer) {
        console.log('✅ Найден пригласивший пользователь:', referrer.user_id);
        
        // Получаем сохранение игры пригласившего
        const { data: saveData } = await supabase
          .from(SAVES_TABLE)
          .select('game_data')
          .eq('user_id', referrer.user_id)
          .single();
          
        if (saveData && saveData.game_data) {
          // Добавляем нового реферала в список пригласившего
          const gameData = saveData.game_data as any;
          
          // Всегда устанавливаем activated: false для нового реферала
          const newReferral = {
            id: userId,
            username: `Пользователь ${userId.substring(0, 6)}`,
            activated: false,
            joinedAt: Date.now()
          };
          
          console.log('Добавление нового реферала с явным статусом активации (false):', newReferral);
          
          const updatedReferrals = gameData.referrals 
            ? [...gameData.referrals.filter((r: any) => r.id !== userId), newReferral]
            : [newReferral];
            
          const updatedGameData = {
            ...gameData,
            referrals: updatedReferrals
          };
          
          // Обновляем сохранение пригласившего
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
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при работе с реферальной информацией:', error);
    return false;
  }
};

// Получение рефералов пользователя
export const getUserReferrals = async (): Promise<any[]> => {
  try {
    const userId = await getUserIdentifier();
    console.log('Получение рефералов для пользователя:', userId);
    
    // Проверяем, является ли пользователь тестовым пользователем romanaliev
    if (userId === '123456789') { // Заменим на реальный Telegram ID романа
      console.log('Обнаружен тестовый пользователь romanaliev, добавляем тестовый реферал');
      
      return [
        {
          user_id: '987654321', // Заменим на реальный Telegram ID ланы
          created_at: new Date().toISOString(),
          referral_code: 'TEST_REF_CODE_LANA'
        }
      ];
    }
    
    // Получаем реферальный код пользователя
    const userReferralCode = await getUserReferralCode(userId);
    
    if (!userReferralCode) {
      console.warn('⚠️ Не удалось получить реферальный код пользователя');
      return [];
    }
    
    // Получаем всех пользователей, которые указали данного пользователя как реферера
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('*')
      .eq('referred_by', userReferralCode);
    
    if (error) {
      console.error('❌ Ошибка при получении списка рефералов:', error);
      return [];
    }
    
    console.log(`✅ Получено ${data?.length || 0} рефералов:`, data);
    return data || [];
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

// Проверка и обновление реферальной информации при запуске
export const checkReferralInfo = async (referralCode: string, referredBy: string | null): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    // Проверяем наличие записи для этого пользователя
    const { data: existingData } = await supabase
      .from(REFERRAL_TABLE)
      .select()
      .eq('user_id', userId)
      .single();
    
    if (existingData) {
      console.log('✅ Реферальная информация уже существует для пользователя', userId);
      return;
    }
    
    // Если записи нет, сохраняем реферальную информацию
    await saveReferralInfo(referralCode, referredBy);
    
    // Если есть информация о реферере, обновляем его список рефералов
    if (referredBy) {
      // Получаем информацию о реферере
      const { data: referrerData } = await supabase
        .from(REFERRAL_TABLE)
        .select('user_id')
        .eq('referral_code', referredBy)
        .single();
        
      if (referrerData) {
        console.log('✅ Обновляем информацию о рефералах для пользователя', referrerData.user_id);
        
        // Здесь можно добавить код для обновления статистики реферера
        // или отправки уведомления о новом реферале
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке реферальной информации:', error);
  }
};

// Активация реферала (когда реферал покупает генератор)
export const activateReferral = async (referralId: string): Promise<boolean> => {
  try {
    console.log('🔄 Активация реферала:', referralId);
    
    // Получаем ID пользователя, который пригласил текущего пользователя
    const userId = await getUserIdentifier();
    
    // Получаем информацию о том, кто пригласил текущего пользователя
    const { data: userData } = await supabase
      .from(REFERRAL_TABLE)
      .select('referred_by')
      .eq('user_id', userId)
      .single();
      
    if (!userData || !userData.referred_by) {
      console.warn('⚠️ Нет информации о том, кто пригласил пользователя');
      return false;
    }
    
    // Получаем user_id пригласившего по его реферальному коду
    const { data: referrerData } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id')
      .eq('referral_code', userData.referred_by)
      .single();
      
    if (!referrerData) {
      console.warn('⚠️ Не найден пользователь с реферальным кодом', userData.referred_by);
      return false;
    }
    
    console.log('✅ Найден пригласивший пользователь:', referrerData.user_id);
    
    // Получаем сохранение игры пригласившего
    const { data: saveData } = await supabase
      .from(SAVES_TABLE)
      .select('game_data')
      .eq('user_id', referrerData.user_id)
      .single();
      
    if (!saveData || !saveData.game_data) {
      console.warn('⚠️ Не найдено сохранение игры для пользователя', referrerData.user_id);
      return false;
    }
    
    // Обновляем список рефералов, активируя нужного
    const gameData = saveData.game_data as any;
    if (gameData.referrals) {
      // Ищем реферала в списке
      const referral = gameData.referrals.find((ref: any) => ref.id === referralId);
      
      if (!referral) {
        console.warn('⚠️ Реферал с ID', referralId, 'не найден в списке рефералов');
        
        // Добавляем нового реферала (активированного!)
        const newReferral = {
          id: referralId,
          username: `Пользователь ${referralId.substring(0, 6)}`,
          activated: true, // Активирован, т.к. куплено исследование
          joinedAt: Date.now()
        };
        
        console.log('Добавляем и активируем нового реферала:', newReferral);
        
        // Добавляем нового реферала
        gameData.referrals.push(newReferral);
        
        // Сохраняем обновленные данные
        const { error } = await supabase
          .from(SAVES_TABLE)
          .update({ game_data: gameData })
          .eq('user_id', referrerData.user_id);
        
        if (error) {
          console.error('❌ Ошибка при добавлении нового реферала:', error);
          return false;
        }
        
        console.log('✅ Добавлен и активирован новый реферал с ID', referralId);
        return true;
      }
      
      // Если реферал уже активирован, ничего не делаем
      if (referral.activated) {
        console.log('⚠️ Реферал уже активирован');
        return true;
      }
      
      console.log('Активируем реферала. Статус до:', referral.activated);
      
      // Активируем реферала
      const updatedReferrals = gameData.referrals.map((ref: any) => 
        ref.id === referralId ? { ...ref, activated: true } : ref
      );
      
      // Обновляем только список рефералов
      const updatedGameData = {
        ...gameData,
        referrals: updatedReferrals
      };
      
      console.log('Обновленные рефералы после активации:', 
        updatedReferrals.map((r: any) => ({ id: r.id, activated: r.activated }))
      );
      
      const { error } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: updatedGameData })
        .eq('user_id', referrerData.user_id);
      
      if (error) {
        console.error('❌ Ошибка при обновлении списка рефералов:', error);
        return false;
      }
      
      console.log('✅ Реферал успешно активирован');
      return true;
    } else {
      console.warn('⚠️ У пользователя нет списка рефералов');
      
      // Создаем массив рефералов если его нет
      gameData.referrals = [{
        id: referralId,
        username: `Пользователь ${referralId.substring(0, 6)}`,
        activated: true, // Активирован, т.к. куплено исследование
        joinedAt: Date.now()
      }];
      
      console.log('Создан новый массив рефералов:', gameData.referrals);
      
      // Сохраняем обновленные данные
      const { error } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: gameData })
        .eq('user_id', referrerData.user_id);
        
      if (error) {
        console.error('❌ Ошибка при создании списка рефералов:', error);
        return false;
      }
      
      console.log('✅ Создан список рефералов и активирован реферал');
      return true;
    }
  } catch (error) {
    console.error('❌ Ошибка при активации реферала:', error);
    return false;
  }
};
