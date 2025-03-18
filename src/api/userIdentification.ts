
// Сервис идентификации пользователей

import { isTelegramWebAppAvailable } from '@/utils/helpers';

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
  // Проверка на специальные тестовые аккаунты по имени хоста или другим параметрам
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
