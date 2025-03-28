
import { isTelegramWebAppAvailable } from "./helpers";

export const initializeTelegram = (): void => {
  console.log('🔍 Проверка Telegram WebApp...');
  
  // Защитная проверка существования глобальных переменных
  if (typeof window === 'undefined') {
    console.log('⚠️ Объект window не доступен');
    return;
  }
  
  // Устанавливаем флаг принудительного режима по умолчанию
  window.__FORCE_TELEGRAM_MODE = window.__FORCE_TELEGRAM_MODE || false;
  
  // Проверяем наличие Telegram WebApp API
  const isTgAvailable = isTelegramWebAppAvailable();
  console.log(isTgAvailable ? '✅ Telegram WebApp обнаружен' : '⚠️ Telegram WebApp не обнаружен');
  
  if (!isTgAvailable) {
    console.log('ℹ️ Используем стандартный режим');
    return;
  }
  
  try {
    // Безопасная проверка доступности Telegram объекта
    if (!window.Telegram || !window.Telegram.WebApp) {
      console.warn('⚠️ Объект Telegram.WebApp не доступен или не инициализирован');
      return;
    }
    
    const tg = window.Telegram.WebApp;
    
    // Устанавливаем флаг режима Telegram
    window.__FORCE_TELEGRAM_MODE = true;
    console.log('✅ Принудительный режим Telegram WebApp включен');
    
    // Безопасно отправляем ready сигнал
    setTimeout(() => {
      try {
        if (typeof tg.ready === 'function') {
          tg.ready();
          console.log('✅ Telegram WebApp ready отправлен');
        }
      } catch (readyError) {
        console.error('❌ Ошибка при вызове tg.ready():', readyError);
      }
    }, 50);
    
    // Безопасно разворачиваем приложение
    setTimeout(() => {
      try {
        if (typeof tg.expand === 'function') {
          tg.expand();
          console.log('✅ Telegram WebApp расширен на весь экран');
        }
      } catch (expandError) {
        console.error('❌ Ошибка при вызове tg.expand():', expandError);
      }
    }, 100);
    
    // Сохраняем информацию о пользователе, если доступна
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      console.log(`✅ Пользователь идентифицирован: id=${tg.initDataUnsafe.user.id || 'неизвестно'}, username=${tg.initDataUnsafe.user.username || 'нет'}`);
      
      // Сразу сохраняем ID пользователя в глобальную переменную
      if (tg.initDataUnsafe.user.id) {
        window.__game_user_id = `tg_${tg.initDataUnsafe.user.id}`;
        console.log(`✅ ID пользователя сохранен в глобальной переменной: ${window.__game_user_id}`);
      }
    } else {
      console.warn('⚠️ Данные пользователя Telegram отсутствуют или недоступны');
    }
  } catch (error) {
    console.error('❌ Ошибка при инициализации Telegram WebApp:', error);
  }
};

// Проверка наличия Telegram WebApp без вызова ошибок
export const isTelegramAvailable = (): boolean => {
  try {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Ошибка при проверке доступности Telegram WebApp:', error);
    return false;
  }
};

// Безопасное получение объекта Telegram.WebApp
export const getTelegramWebApp = () => {
  try {
    if (isTelegramAvailable()) {
      return window.Telegram.WebApp;
    }
    return null;
  } catch (error) {
    console.error('❌ Ошибка при получении объекта Telegram WebApp:', error);
    return null;
  }
};

