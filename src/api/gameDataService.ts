
// API сервис для сохранения и загрузки игрового прогресса с Supabase

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Константы
const SAVES_TABLE = 'game_saves';
const REFERRAL_TABLE = 'referral_data';
const REFERRAL_HELPERS_TABLE = 'referral_helpers';
const CHECK_CONNECTION_INTERVAL = 5000; // 5 секунд между проверками соединения

// Кэш для проверки соединения
let lastCheckTime = 0;
let cachedConnectionResult = false;

// Создание SQL функции для создания таблицы если она не существует
export const createSavesTableIfNotExists = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка существования и создание таблицы сохранений если необходима...');
    
    // Вызываем функцию create_saves_table, которая создаст таблицы если они не существуют
    const { error } = await supabase.rpc('create_saves_table');
    
    if (error) {
      console.error('❌ Ошибка при создании таблицы сохранений:', error);
      
      // Проверяем существование таблицы напрямую
      const { error: checkError } = await supabase.from(SAVES_TABLE).select('count').limit(1);
      if (!checkError) {
        console.log('✅ Таблица сохранений уже существует');
        return true;
      }
      
      return false;
    }
    
    console.log('✅ Таблица сохранений успешно создана или уже существует');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании таблицы сохранений:', error);
    return false;
  }
};

// Получение идентификатора пользователя с приоритетом Telegram
export const getUserIdentifier = async (): Promise<string> => {
  // Проверяем есть ли сохраненный ID в памяти
  const cachedId = window.__game_user_id;
  if (cachedId) {
    console.log(`Использую сохраненный в памяти ID: ${cachedId}`);
    return cachedId;
  }
  
  // Пытаемся получить Telegram ID с наивысшим приоритетом
  if (isTelegramWebAppAvailable()) {
    try {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user?.id) {
        const telegramUserId = String(tg.initDataUnsafe.user.id); // Преобразуем в строку для обеспечения типа
        
        // Сохраняем ID в памяти
        window.__game_user_id = telegramUserId;
        console.log(`✅ Получен ID пользователя Telegram: ${telegramUserId}`);
        
        // Добавим вывод телеграм данных для отладки
        const telegramUser = tg.initDataUnsafe.user;
        console.log('Данные пользователя Telegram:', {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name
        });
        
        return telegramUserId;
      } else {
        console.warn('⚠️ Telegram WebApp доступен, но данные пользователя отсутствуют');
      }
    } catch (error) {
      console.error('Ошибка при получении Telegram ID:', error);
    }
  } else {
    console.log('Telegram WebApp не доступен, используем локальный ID');
  }
  
  // Для тестовых аккаунтов возвращаем хардкодированные идентификаторы
  // Проверка на специаль��ые тестовые аккаунты по имени хоста или другим параметрам
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const urlParams = new URLSearchParams(window.location.search);
  const testUser = urlParams.get('test_user');
  
  if (testUser === 'romanaliev' || (isLocalhost && localStorage.getItem('test_user') === 'romanaliev')) {
    const testId = '123456789'; // Фиксированный ID для romanaliev
    window.__game_user_id = testId;
    console.log(`✅ Использую тестовый ID для romanaliev: ${testId}`);
    return testId;
  }
  
  if (testUser === 'lanakores' || (isLocalhost && localStorage.getItem('test_user') === 'lanakores')) {
    const testId = '987654321'; // Фиксированный ID для lanakores
    window.__game_user_id = testId;
    console.log(`✅ Использую тестовый ID для lanakores: ${testId}`);
    return testId;
  }
  
  // Если нет соединения с Telegram или не смогли получить ID, используем локально сохраненный ID
  let localUserId = localStorage.getItem('crypto_civ_user_id');
  
  // Если локального ID нет, генерируем новый
  if (!localUserId) {
    localUserId = `local_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    localStorage.setItem('crypto_civ_user_id', localUserId);
    console.log(`✅ Создан новый локальный ID пользователя: ${localUserId}`);
  } else {
    console.log(`✅ Использован сохраненный локальный ID: ${localUserId}`);
  }
  
  window.__game_user_id = localUserId;
  return localUserId;
};

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  // Дебаунс: если прошло менее 5 секунд с последней проверки, возвращаем кешированный результат
  const now = Date.now();
  if (now - lastCheckTime < CHECK_CONNECTION_INTERVAL) {
    return cachedConnectionResult;
  }
  
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Простая проверка на доступность API
    const { data, error } = await supabase.auth.getSession();
    
    // Соединение работает, если нет ошибки
    const isConnected = !error;
    
    lastCheckTime = now;
    cachedConnectionResult = isConnected;
    
    if (isConnected) {
      console.log('✅ Соединение с Supabase установлено');
      
      // Проверяем, нужно ли создать таблицы
      await createSavesTableIfNotExists();
    } else {
      console.warn('⚠️ Не удалось подключиться к Supabase:', error);
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к Supabase:', error);
    
    lastCheckTime = now;
    cachedConnectionResult = false;
    
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
              const newReferral = {
                id: userId,
                username: `Пользователь ${userId.substring(0, 6)}`,
                activated: false, // Важно: всегда устанавливаем как неактивный
                joinedAt: Date.now()
              };
              
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
          const newReferral = {
            id: userId,
            username: `Пользователь ${userId.substring(0, 6)}`,
            activated: false, // Важно: всегда устанавливаем как неактивный
            joinedAt: Date.now()
          };
          
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

// Сохранение игры в Supabase
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      safeDispatchGameEvent(
        "Не удалось сохранить прогресс. Проверьте соединение с интернетом.", 
        "error"
      );
      return false;
    }
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Преобразуем GameState в Json
    let gameDataJson: Json;
    try {
      const jsonString = JSON.stringify(gameState);
      gameDataJson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Ошибка преобразова��ия состояния игры в JSON:', parseError);
      return false;
    }
    
    // Готовим данные для сохранения
    const saveData = {
      user_id: userId,
      game_data: gameDataJson,
      updated_at: new Date().toISOString()
    };
    
    // Обновляем существующую запись
    const { error } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (error) {
      console.error('❌ Ошибка при сохранении в Supabase:', error);
      
      // Пробуем создать таблицу и повторить попытку если таблица не существует
      if (error.code === 'PGRST116') {
        const tableCreated = await createSavesTableIfNotExists();
        if (tableCreated) {
          // Повторяем попытку сохранения
          const { error: retryError } = await supabase
            .from(SAVES_TABLE)
            .upsert(saveData, { onConflict: 'user_id' });
            
          if (retryError) {
            console.error('❌ Ошибка при повторном сохранении в Supabase:', retryError);
            return false;
          }
          
          console.log('✅ Игра успешно сохранена после создания таблицы');
          return true;
        }
      }
      
      return false;
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    return false;
  }
};

// Загрузка игры из Supabase
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      safeDispatchGameEvent(
        "Не удалось загрузить прогресс. Проверьте соединение с интернетом.",
        "error"
      );
      return null;
    }
    
    console.log('🔄 Загрузка из Supabase...');
    
    const { data, error } = await supabase
      .from(SAVES_TABLE)
      .select('game_data, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Ошибка при загрузке из Supabase:', error);
      
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Таблица сохранений не существует в Supabase');
        
        // Создаем таблицу, если её нет
        const tableCreated = await createSavesTableIfNotExists();
        
        if (tableCreated) {
          console.log('✅ Таблица сохранений создана');
          
          // Сразу попытаемся получить данные еще раз (после создания таблицы)
          const retryResult = await supabase
            .from(SAVES_TABLE)
            .select('game_data, updated_at')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (retryResult.data && retryResult.data.game_data) {
            console.log('✅ Данные успешно загружены после создания таблицы');
            return retryResult.data.game_data as any;
          }
        }
      }
      
      return null;
    } 
    
    if (data && data.game_data) {
      console.log('✅ Игра загружена из Supabase, дата обновления:', data.updated_at);
      
      try {
        const gameState = data.game_data as any;
        
        // Проверка целостности данных
        if (validateGameState(gameState)) {
          console.log('✅ Проверка целостности данных из Supabase пройдена');
          
          // Обновляем lastUpdate и lastSaved
          if (!gameState.lastUpdate) {
            gameState.lastUpdate = Date.now();
          }
          if (!gameState.lastSaved) {
            gameState.lastSaved = Date.now();
          }
          
          // Важно: устанавливаем флаг gameStarted
          gameState.gameStarted = true;
          
          return gameState;
        } else {
          console.error('❌ Проверка целостности данных из Supabase не пройдена');
          safeDispatchGameEvent(
            "Данные из облака повреждены. Начинаем новую игру.",
            "warning"
          );
          return null;
        }
      } catch (parseError) {
        console.error('❌ Ошибка при обработке данных из Supabase:', parseError);
        return null;
      }
    }
    
    console.log('❌ Сохранение в Supabase не найдено');
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибк�� при загрузке игры:', error);
    safeDispatchGameEvent(
      "Критическая ошибка при загрузке игры. Начинаем новую игру.",
      "error"
    );
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
    console.log('Активация реферала:', referralId);
    
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
        
        // Добавляем реферала, если его нет в списке
        gameData.referrals.push({
          id: referralId,
          username: `Пользователь ${referralId.substring(0, 6)}`,
          activated: true,
          joinedAt: Date.now()
        });
        
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
      
      // Активируем реферала
      const updatedReferrals = gameData.referrals.map((ref: any) => 
        ref.id === referralId ? { ...ref, activated: true } : ref
      );
      
      // Обновляем только список рефералов
      const updatedGameData = {
        ...gameData,
        referrals: updatedReferrals
      };
      
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
    }
    
    return false;
  } catch (error) {
    console.error('❌ Ошибка при активации реферала:', error);
    return false;
  }
};

// Валидация структуры данных игры
function validateGameState(state: any): boolean {
  if (!state) return false;
  
  // Проверяем наличие ключевых полей
  const requiredFields = ['resources', 'buildings', 'upgrades', 'unlocks'];
  for (const field of requiredFields) {
    if (!state[field] || typeof state[field] !== 'object') {
      console.error(`❌ Отсутствует или некорректно поле ${field}`);
      return false;
    }
  }
  
  // Проверяем наличие ключевых ресурсов
  if (!state.resources.knowledge || !state.resources.usdt) {
    console.error('❌ Отсутствуют базовые ресурсы knowledge или usdt');
    return false;
  }
  
  return true;
}

// Функция для очистки всех сохранений (для отладки)
export const clearAllSavedData = async (): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
      console.log('🔄 Удаление сохранения из Supabase...');
      
      const { error } = await supabase
        .from(SAVES_TABLE)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Ошибка при удалении сохранения из Supabase:', error);
        
        toast({
          title: "Ошибка очистки",
          description: "Не удалось очистить сохранения.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Сохранение в Supabase удалено');
        
        // Очищаем также локальное хранилище
        localStorage.removeItem('crypto_civ_user_id');
        
        toast({
          title: "Сохранения очищены",
          description: "Все сохранения игры успешно удалены.",
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к серверу для очистки сохранений.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке сохранений:', error);
    
    toast({
      title: "Ошибка очистки",
      description: "Произошла ошибка при удалении сохранений.",
      variant: "destructive",
    });
  }
};

// НОВАЯ ФУНКЦИЯ: Удаление всех сохранений для всех пользователей (для администратора)
export const clearAllSavedDataForAllUsers = async (): Promise<void> => {
  try {
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
      console.log('🔄 Удаление ВСЕХ сохранений из Supabase...');
      
      // Удаляем все записи из таблицы сохранений
      const { error: savesError } = await supabase
        .from(SAVES_TABLE)
        .delete()
        .neq('user_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      // Удаляем все записи из таблицы помощников
      const { error: helpersError } = await supabase
        .from(REFERRAL_HELPERS_TABLE)
        .delete()
        .neq('helper_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      // Удаляем все записи из таблицы рефералов
      const { error: referralsError } = await supabase
        .from(REFERRAL_TABLE)
        .delete()
        .neq('user_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      if (savesError || helpersError || referralsError) {
        console.error('❌ Ошибки при удалении данных:', { 
          savesError, helpersError, referralsError 
        });
        
        toast({
          title: "Ошибка очистки",
          description: "Не удалось очистить все сохранения.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Все сохранения в Supabase удалены');
        
        // Очищаем также локальное хранилище текущего пользователя
        localStorage.removeItem('crypto_civ_user_id');
        
        toast({
          title: "Все сохранения очищены",
          description: "Все данные�� игры для всех пользователей успешно удалены.",
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к серверу для очистки сохранений.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке всех сохранений:', error);
    
    toast({
      title: "Ошибка очистки",
      description: "Произошла ошибка при удалении всех сохранений.",
      variant: "destructive",
    });
  }
};

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
  }
}

