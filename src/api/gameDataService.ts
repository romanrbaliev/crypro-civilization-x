// API сервис для сохранения и загрузки игрового прогресса

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";

// Базовый URL для нашего API - используем переменную окружения с запасным вариантом
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Адреса API эндпоинтов
const ENDPOINTS = {
  SAVE_GAME: `${API_BASE_URL}/game/save`,
  LOAD_GAME: `${API_BASE_URL}/game/load`,
};

// Имя ключа для локального резервного хранилища
const LOCAL_BACKUP_KEY = 'cryptoCivilizationLocalBackup';

// Получение идентификатора пользователя
const getUserIdentifier = (): string => {
  // Пытаемся получить Telegram ID
  if (isTelegramWebAppAvailable()) {
    try {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user?.id) {
        return `tg_${tg.initDataUnsafe.user.id}`;
      }
    } catch (error) {
      console.error('Ошибка при получении Telegram ID:', error);
    }
  }
  
  // Если Telegram ID не доступен, используем локальный идентификатор из localStorage
  let localId = localStorage.getItem('game_user_id');
  if (!localId) {
    localId = `local_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('game_user_id', localId);
  }
  
  return localId;
};

// Сохранение игры на сервере
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = getUserIdentifier();
    console.log(`🔄 Сохранение игры на сервере для пользователя: ${userId}`);
    
    // Всегда сохраняем копию локально как резервный вариант
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({
        gameData: gameState,
        timestamp: Date.now(),
        userId
      }));
      console.log('✅ Создана локальная резервная копия игры');
    } catch (backupError) {
      console.error('❌ Ошибка при создании локальной резервной копии:', backupError);
    }
    
    // Если нет интернета или API недоступен, сразу возвращаем успех,
    // так как мы уже сохранили локально
    if (!navigator.onLine) {
      console.log('⚠️ Нет подключения к интернету, используем только локальное сохранение');
      return true;
    }
    
    // Подготовка данных для отправки
    const payload = {
      userId,
      gameData: gameState,
      timestamp: Date.now(),
      clientInfo: {
        platform: navigator.platform,
        isTelegram: isTelegramWebAppAvailable(),
      }
    };
    
    // Устанавливаем таймаут для запроса (5 секунд)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Отправляем запрос на сервер
    const response = await fetch(ENDPOINTS.SAVE_GAME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Игра успешно сохранена на сервере:', result);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры на сервере:', error);
    
    // Мы уже создали локальную резервную копию вначале функции,
    // поэтому просто возвращаем true, так как игра все равно сохранена локально
    return true;
  }
};

// Загрузка игры с сервера
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = getUserIdentifier();
    console.log(`🔄 Загрузка игры с сервера для пользователя: ${userId}`);
    
    // Сначала проверяем наличие локальной резервной копии
    let localBackup = null;
    try {
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        localBackup = JSON.parse(backupData);
        console.log('ℹ️ Найдена локальная резервная копия от:', new Date(localBackup.timestamp).toLocaleString());
      }
    } catch (backupError) {
      console.error('❌ Ошибка при чтении локальной резервной копии:', backupError);
    }
    
    // Если нет интернета, сразу используем локальную копию
    if (!navigator.onLine) {
      console.log('⚠️ Нет подключения к интернету, используем локальную резервную копию');
      
      if (localBackup && localBackup.gameData) {
        console.log('✅ Игра загружена из локальной резервной копии');
        
        toast({
          title: "Автономный режим",
          description: "Нет подключения к интернету. Игра загружена из локальной копии.",
          variant: "warning",
        });
        
        return localBackup.gameData;
      }
      
      console.log('❌ Локальная резервная копия не найдена');
      return null;
    }
    
    // Устанавливаем таймаут для запроса (5 секунд)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Отправляем запрос на сервер
    const response = await fetch(`${ENDPOINTS.LOAD_GAME}?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Обрабатываем ответ сервера
    if (response.status === 404) {
      console.log('ℹ️ Сохраненной игры не найдено на сервере');
      
      // Если на сервере нет сохранения, но есть локальная копия, используем её
      if (localBackup && localBackup.gameData) {
        console.log('✅ Игра загружена из локальной резервной копии');
        
        toast({
          title: "Локальное восстановление",
          description: "Сохранение на сервере не найдено. Игра загружена из локальной копии.",
          variant: "warning",
        });
        
        return localBackup.gameData;
      }
      
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.gameData) {
      console.log('ℹ️ Сервер вернул пустые данные игры');
      
      // Если сервер вернул пустые данные, но есть локальная копия, используе�� её
      if (localBackup && localBackup.gameData) {
        console.log('✅ Игра загружена из локальной резервной копии');
        
        toast({
          title: "Локальное восстановление",
          description: "Сервер вернул пустые данные. Игра загружена из локальной копии.",
          variant: "warning",
        });
        
        return localBackup.gameData;
      }
      
      return null;
    }
    
    console.log('✅ Игра успешно загружена с сервера:', result);
    
    // Проверка на случай, если сервер вернул не объект GameState
    if (typeof result.gameData !== 'object') {
      throw new Error('Сервер вернул некорректные данные игры');
    }
    
    // Сохраняем серверные данные локально для резервной копии
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({
        gameData: result.gameData,
        timestamp: Date.now(),
        userId
      }));
      console.log('✅ Обновлена локальная резервная копия из данных сервера');
    } catch (backupError) {
      console.error('❌ Ошибка при обновлении локальной резервной копии:', backupError);
    }
    
    return result.gameData as GameState;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры с сервера:', error);
    
    // При ошибке сети, пытаемся загрузить из локальной резервной копии
    try {
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      
      if (backupData) {
        console.log('⚠️ Загружаем игру из локальной резервной копии');
        const backup = JSON.parse(backupData);
        
        // Показываем уведомление о загрузке из резервной копии
        toast({
          title: "Внимание",
          description: "Не удалось загрузить данные с сервера. Используем локальную резервную копию.",
          variant: "warning",
        });
        
        return backup.gameData;
      }
    } catch (backupError) {
      console.error('❌ Не удалось загрузить локальную резервную копию:', backupError);
    }
    
    // Показываем уведомление о проблемах с загрузкой
    toast({
      title: "Ошибка загрузки",
      description: "Не удалось загрузить игру. Начинаем новую игру.",
      variant: "destructive",
    });
    
    return null;
  }
};

// Функция для очистки всех сохранений (для отладки)
export const clearAllSavedData = (): void => {
  try {
    localStorage.removeItem(LOCAL_BACKUP_KEY);
    localStorage.removeItem('game_user_id');
    console.log('✅ Все локальные сохранения очищены');
    
    toast({
      title: "Сохранения очищены",
      description: "Все локальные сохранения игры удалены.",
      variant: "default",
    });
  } catch (error) {
    console.error('❌ Ошибка при очистке сохранений:', error);
  }
};
