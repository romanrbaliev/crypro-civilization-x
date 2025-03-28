
import { isTelegramWebAppAvailable } from "./helpers";

export const initializeTelegram = (): void => {
  console.log('🔍 Проверка Telegram WebApp...');
  
  if (isTelegramWebAppAvailable()) {
    console.log('✅ Telegram WebApp обнаружен, инициализация...');
    try {
      const tg = window.Telegram.WebApp;
      
      if (typeof window !== 'undefined') {
        window.__FORCE_TELEGRAM_MODE = true;
        console.log('✅ Принудительный режим Telegram WebApp включен');
      }
      
      // Установка безопасного таймаута для вызова ready
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
      
      // Установка безопасного таймаута для вызова expand
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
      
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        console.log(`✅ Пользователь идентифицирован: id=${tg.initDataUnsafe.user.id}, username=${tg.initDataUnsafe.user.username || 'нет'}`);
        
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
  } else {
    console.log('ℹ️ Telegram WebApp не обнаружен, использование стандартного режима');
  }
};
