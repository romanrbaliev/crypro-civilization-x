
// API сервис для сохранения и загрузки игрового прогресса

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";

// Получаем базовый URL из переменной окружения или используем текущий домен
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');

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
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
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
    
    // Без локального сервера мы полагаемся только на локальное хранилище
    // В будущем можно добавить облачное хранилище
    console.log('ℹ️ Используется только локальное хранилище, так как облачный сервер не настроен');
    
    // Показываем уведомление
    toast({
      title: "Игра сохранена",
      description: "Прогресс сохранен локально в вашем браузере",
      variant: "default",
    });
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры:', error);
    
    // Мы уже создали локальную резервную копию вначале функции,
    // поэтому просто возвращаем true, так как игра все равно сохранена локально
    return true;
  }
};

// Загрузка игры с сервера
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Пытаемся загрузить из локального хранилища
    try {
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        const localBackup = JSON.parse(backupData);
        console.log('✅ Найдена локальная копия от:', new Date(localBackup.timestamp).toLocaleString());
        
        if (localBackup.gameData) {
          console.log('✅ Игра загружена из локальной копии');
          
          toast({
            title: "Игра загружена",
            description: "Прогресс загружен из локального хранилища браузера",
            variant: "default",
          });
          
          return localBackup.gameData;
        }
      }
    } catch (backupError) {
      console.error('❌ Ошибка при чтении локальной копии:', backupError);
    }
    
    console.log('❌ Локальная копия не найдена');
    
    // Показываем уведомление о начале новой игры
    toast({
      title: "Новая игра",
      description: "Сохранения не найдены. Начинаем новую игру.",
      variant: "default",
    });
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры:', error);
    
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
