
// Сервис идентификации пользователей

import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Получение идентификатора пользователя с приоритетом Telegram
 * @returns Идентификатор пользователя
 */
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
        // Преобразуем в строку для обеспечения типа
        // Добавляем префикс tg_ для явного обозначения пользователей Telegram
        const telegramUserId = `tg_${String(tg.initDataUnsafe.user.id)}`; 
        
        // Сохраняем ID в памяти
        window.__game_user_id = telegramUserId;
        console.log(`✅ Получен ID пользователя Telegram: ${telegramUserId}`);
        
        // Добавим вывод телеграм данных для отладки
        const telegramUser = tg.initDataUnsafe.user;
        console.log('Данные пользователя Telegram:', {
          id: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          rawUserId: telegramUserId
        });
        
        // Проверяем существует ли запись пользователя в таблице referral_data
        await checkAndCreateReferralRecord(telegramUserId);
        
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
  
  // Проверяем существует ли запись пользователя в таблице referral_data для локального пользователя
  await checkAndCreateReferralRecord(localUserId);
  
  return localUserId;
};

/**
 * Функция проверки и создания записи в таблице referral_data
 * @param userId ID пользователя
 */
const checkAndCreateReferralRecord = async (userId: string): Promise<void> => {
  try {
    console.log('Проверка наличия пользователя в таблице referral_data:', userId);
    
    // Проверяем наличие записи в базе данных
    const { data, error } = await supabase
      .from('referral_data')
      .select('user_id')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Ошибка при проверке пользователя в referral_data:', error);
      return;
    }
    
    if (data) {
      console.log('✅ Пользователь уже существует в таблице referral_data');
      return;
    }
    
    // Если записи нет, генерируем реферальный код и создаём запись
    const newCode = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    
    console.log('Генерация новой записи в referral_data с кодом:', newCode);
    
    const { error: insertError } = await supabase
      .from('referral_data')
      .insert({
        user_id: userId,
        referral_code: newCode,
        is_activated: false
      });
      
    if (insertError) {
      console.error('❌ Ошибка при создании записи в referral_data:', insertError);
    } else {
      console.log('✅ Запись в referral_data успешно создана');
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке/создании записи в referral_data:', error);
  }
};
