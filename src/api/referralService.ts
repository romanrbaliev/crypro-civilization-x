
// Сервис для работы с реферальной системой

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { checkSupabaseConnection } from './connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { REFERRAL_TABLE, SAVES_TABLE } from './apiTypes';

// Функция для добавления поля is_activated в таблицу referral_data, если его еще нет
export const ensureReferralTableStructure = async (): Promise<boolean> => {
  try {
    // Проверяем соединение
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Ошибка соединения с Supabase при проверке структуры таблицы');
      return false;
    }

    // Добавляем поле is_activated, если оно отсутствует
    const { error } = await supabase.rpc(
      'exec_sql',
      { 
        sql: `
          ALTER TABLE IF EXISTS ${REFERRAL_TABLE} 
          ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;
        `
      }
    );

    if (error) {
      console.error('❌ Ошибка при обновлении структуры таблицы:', error);
      return false;
    }

    console.log('✅ Таблица рефералов проверена и обновлена при необходимости');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при обновлении структуры таблицы:', error);
    return false;
  }
};

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
    
    // Проверяем структуру таблицы
    await ensureReferralTableStructure();
    
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
              
              // Используем информацию о статусе активации из базы данных
              const newReferral = {
                id: userId,
                username: `Пользователь ${userId.substring(0, 6)}`,
                activated: false, // Изначально не активирован
                joinedAt: Date.now()
              };
              
              console.log('Добавление реферала со статусом активации (false):', newReferral);
              
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
    
    // Создаем новую запись с полем is_activated = false
    const { error } = await supabase
      .from(REFERRAL_TABLE)
      .insert({
        user_id: userId,
        referral_code: referralCode,
        referred_by: referredBy,
        is_activated: false // По умолчанию не активирован
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
          
          // Создаем запись реферала с начальным статусом активации false
          const newReferral = {
            id: userId,
            username: `Пользователь ${userId.substring(0, 6)}`,
            activated: false, // Изначально не активирован
            joinedAt: Date.now()
          };
          
          console.log('Добавление нового реферала со статусом активации (false):', newReferral);
          
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

// Получение рефералов пользователя с учетом статуса активации из базы данных
export const getUserReferrals = async (): Promise<any[]> => {
  try {
    const userId = await getUserIdentifier();
    console.log('Получение рефералов для пользователя:', userId);
    
    // Получаем реферальный код пользователя
    const userReferralCode = await getUserReferralCode(userId);
    
    if (!userReferralCode) {
      console.warn('⚠️ Не удалось получить реферальный код пользователя');
      return [];
    }
    
    // Получаем всех пользователей, которые указали данного пользователя как реферера
    // Включаем поле is_activated в запрос
    const { data, error } = await supabase
      .from(REFERRAL_TABLE)
      .select('user_id, created_at, is_activated')
      .eq('referred_by', userReferralCode);
    
    if (error) {
      console.error('❌ Ошибка при получении списка рефералов:', error);
      return [];
    }
    
    // Преобразуем данные из БД в формат для UI
    const formattedReferrals = data?.map(ref => ({
      id: ref.user_id,
      username: `Пользователь ${ref.user_id.substring(0, 6)}`,
      activated: ref.is_activated || false, // Используем статус из БД
      joinedAt: ref.created_at ? new Date(ref.created_at).getTime() : Date.now()
    })) || [];
    
    console.log(`✅ Получено ${formattedReferrals.length} рефералов:`, formattedReferrals);
    return formattedReferrals;
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
    
    // Проверяем структуру таблицы
    await ensureReferralTableStructure();
    
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
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Ошибка соединения с Supabase при активации реферала');
      return false;
    }
    
    // Получаем ID пользователя
    const userId = await getUserIdentifier();
    console.log('Активация выполняется пользователем:', userId);
    
    // Обновляем поле is_activated в таблице referral_data
    const { error: updateError } = await supabase
      .from(REFERRAL_TABLE)
      .update({ is_activated: true })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('❌ Ошибка при обновлении статуса активации:', updateError);
      return false;
    }
    
    console.log('✅ Статус активации обновлен в базе данных');
      
    // Получаем информацию о том, кто пригласил текущего пользователя
    const { data: userData, error: userError } = await supabase
      .from(REFERRAL_TABLE)
      .select('referred_by')
      .eq('user_id', userId)
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
    
    // Получаем user_id пригласившего по его реферальному коду
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
    
    // Обновляем список рефералов, активируя нужного
    const gameData = saveData.game_data as any;
    
    console.log('Текущие рефералы у пригласившего:', JSON.stringify(gameData.referrals, null, 2));
    
    if (!gameData.referrals) {
      // Создаем массив рефералов если его нет
      gameData.referrals = [{
        id: userId,
        username: `Пользователь ${userId.substring(0, 6)}`,
        activated: true, // Активирован
        joinedAt: Date.now()
      }];
      
      console.log('Создан новый массив рефералов:', gameData.referrals);
      
      // Сохраняем обновленные данные
      const { error: updateError } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: gameData })
        .eq('user_id', referrerData.user_id);
        
      if (updateError) {
        console.error('❌ Ошибка при создании списка рефералов:', updateError);
        return false;
      }
      
      console.log('✅ Создан список рефералов и активирован реферал');
      
      // Отправляем событие об успешной активации
      safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
      
      return true;
    } else {
      // Ищем реферала в списке
      const referralIndex = gameData.referrals.findIndex((ref: any) => ref.id === userId);
      
      if (referralIndex === -1) {
        console.log('⚠️ Реферал с ID', userId, 'не найден в списке рефералов, добавляем новый');
        
        // Добавляем нового реферала (активированного!)
        const newReferral = {
          id: userId,
          username: `Пользователь ${userId.substring(0, 6)}`,
          activated: true, // Активирован
          joinedAt: Date.now()
        };
        
        console.log('Добавляем и активируем нового реферала:', newReferral);
        
        // Добавляем нового реферала
        gameData.referrals.push(newReferral);
      } else {
        // Обновляем статус активации реферала
        gameData.referrals[referralIndex] = {
          ...gameData.referrals[referralIndex],
          activated: true
        };
      }
      
      console.log('Обновленные рефералы после активации:', 
        gameData.referrals.map((r: any) => ({ id: r.id, activated: r.activated }))
      );
      
      // Сохраняем обновленные данные
      const { error: updateError } = await supabase
        .from(SAVES_TABLE)
        .update({ game_data: gameData })
        .eq('user_id', referrerData.user_id);
      
      if (updateError) {
        console.error('❌ Ошибка при обновлении списка рефералов:', updateError);
        return false;
      }
      
      console.log('✅ Реферал успешно активирован');
      
      // Отправляем событие об успешной активации
      safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
      
      return true;
    }
  } catch (error) {
    console.error('❌ Ошибка при активации реферала:', error);
    return false;
  }
};
