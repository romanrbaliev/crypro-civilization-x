
import { isTelegramWebAppAvailable } from "./helpers";

/**
 * Инициализирует Telegram WebApp
 */
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
      
      if (typeof tg.ready === 'function') {
        tg.ready();
        console.log('✅ Telegram WebApp ready отправлен');
      }
      
      if (typeof tg.expand === 'function') {
        tg.expand();
        console.log('✅ Telegram WebApp расширен на весь экран');
      }
      
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        console.log(`✅ Пользователь идентифицирован: id=${tg.initDataUnsafe.user.id}, username=${tg.initDataUnsafe.user.username || 'нет'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при инициализации Telegram WebApp:', error);
    }
  } else {
    console.log('ℹ️ Telegram WebApp не обнаружен, использование стандартного режима');
  }
};
