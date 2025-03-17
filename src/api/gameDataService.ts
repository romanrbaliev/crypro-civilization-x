
// API сервис для сохранения и загрузки игрового прогресса

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";

// Базовый URL для нашего API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cryptocivilization.ru';

// Адреса API эндпоинтов
const ENDPOINTS = {
  SAVE_GAME: `${API_BASE_URL}/game/save`,
  LOAD_GAME: `${API_BASE_URL}/game/load`,
};

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
    
    // Отправляем запрос на сервер
    const response = await fetch(ENDPOINTS.SAVE_GAME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Игра успешно сохранена на сервере:', result);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры на сервере:', error);
    
    // При ошибке сети, сохраняем локально как резервный вариант
    try {
      const userId = getUserIdentifier();
      localStorage.setItem(`game_backup_${userId}`, JSON.stringify(gameState));
      console.log('✅ Создана локальная резервная копия игры');
    } catch (backupError) {
      console.error('❌ Не удалось создать локальную резервную копию:', backupError);
    }
    
    return false;
  }
};

// Загрузка игры с сервера
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = getUserIdentifier();
    console.log(`🔄 Загрузка игры с сервера для пользователя: ${userId}`);
    
    // Отправляем запрос на сервер
    const response = await fetch(`${ENDPOINTS.LOAD_GAME}?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Обрабатываем ответ сервера
    if (response.status === 404) {
      console.log('ℹ️ Сохраненной игры не найдено на сервере');
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.gameData) {
      console.log('ℹ️ Сервер вернул пустые данные игры');
      return null;
    }
    
    console.log('✅ Игра успешно загружена с сервера:', result);
    
    // Проверка на случай, если сервер вернул не объект GameState
    if (typeof result.gameData !== 'object') {
      throw new Error('Сервер вернул некорректные данные игры');
    }
    
    return result.gameData as GameState;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры с сервера:', error);
    
    // При ошибке сети, пытаемся загрузить из локальной резервной копии
    try {
      const userId = getUserIdentifier();
      const backupData = localStorage.getItem(`game_backup_${userId}`);
      
      if (backupData) {
        console.log('⚠️ Загружаем игру из локальной резервной копии');
        const gameState = JSON.parse(backupData);
        
        // Показываем уведомление о загрузке из резервной копии
        toast({
          title: "Внимание",
          description: "Не удалось загрузить данные с сервера. Используем локальную резервную копию.",
          variant: "warning",
        });
        
        return gameState;
      }
    } catch (backupError) {
      console.error('❌ Не удалось загрузить локальную резервную копию:', backupError);
    }
    
    // Показываем уведомление о проблемах с загрузкой
    toast({
      title: "Ошибка загрузки",
      description: "Не удалось загрузить игру с сервера. Проверьте подключение к интернету.",
      variant: "destructive",
    });
    
    return null;
  }
};
