
// API сервис для сохранения и загрузки игрового прогресса с Supabase

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Флаг, указывающий, что Supabase уже проверен
let supabaseChecked = false;
let supabaseAvailable = false;

// Флаг для отслеживания показа уведомлений
let supabaseNotificationShown = false;

// Имя таблицы для сохранений
const SAVES_TABLE = 'game_saves';

// Имя ключа для локального резервного хранилища
const LOCAL_BACKUP_KEY = 'cryptoCivilizationLocalBackup';

// Дебаунс функция для предотвращения слишком частых проверок
let lastCheckTime = 0;
let cachedConnectionResult = false;

// Получение идентификатора пользователя с приоритетом Telegram
const getUserIdentifier = async (): Promise<string> => {
  // Проверяем есть ли сохраненный ID в памяти
  const cachedId = window.__game_user_id;
  if (cachedId) {
    return cachedId;
  }
  
  // Пытаемся получить Telegram ID с наивысшим приоритетом
  if (isTelegramWebAppAvailable()) {
    try {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user?.id) {
        const telegramUserId = tg.initDataUnsafe.user.id;
        const id = `tg_${telegramUserId}`;
        window.__game_user_id = id;
        console.log(`✅ Получен ID пользователя Telegram: ${id}`);
        
        // Сохраняем ID в localStorage для резерва
        try {
          localStorage.setItem('telegram_user_id', telegramUserId.toString());
        } catch (e) {
          console.warn('⚠️ Не удалось сохранить Telegram ID в localStorage:', e);
        }
        
        return id;
      } else {
        // Пытаемся восстановить из localStorage
        const storedTelegramId = localStorage.getItem('telegram_user_id');
        if (storedTelegramId) {
          const id = `tg_${storedTelegramId}`;
          window.__game_user_id = id;
          console.log(`✅ Восстановлен ID пользователя Telegram из localStorage: ${id}`);
          return id;
        }
      }
    } catch (error) {
      console.error('Ошибка при получении Telegram ID:', error);
    }
  }
  
  // Проверяем авторизацию в Supabase
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const id = `sb_${user.id}`;
        window.__game_user_id = id;
        return id;
      }
    } catch (error) {
      console.error('Ошибка при получении ID пользователя Supabase:', error);
    }
  }
  
  // Если нет Telegram ID и нет авторизации в Supabase, 
  // используем локальный идентификатор из localStorage
  let localId = localStorage.getItem('game_user_id');
  if (!localId) {
    localId = `local_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('game_user_id', localId);
  }
  
  window.__game_user_id = localId;
  return localId;
};

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  // Если уже проверяли - возвращаем кешированный результат
  if (supabaseChecked) {
    return supabaseAvailable;
  }
  
  // Дебаунс: если прошло менее 5 секунд с последней проверки, возвращаем кешированный результат
  const now = Date.now();
  if (now - lastCheckTime < 5000) {
    return cachedConnectionResult;
  }
  
  try {
    // Проверка таблицы или создание, если не существует
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Убедимся, что таблица существует
    const { error } = await supabase
      .from(SAVES_TABLE)
      .select('count')
      .limit(1);
    
    // Если получили ошибку PGRST116, то таблица не существует
    if (error && error.code === 'PGRST116') {
      console.log('⚠️ Таблица сохранений не найдена, пробуем создать...');
      
      // Создаем таблицу через SQL
      const { error: createError } = await supabase.rpc('create_saves_table');
      
      if (createError) {
        console.error('❌ Не удалось создать таблицу:', createError);
        
        // Попробуем еще раз проверить таблицу
        const { error: retryError } = await supabase
          .from(SAVES_TABLE)
          .select('count')
          .limit(1);
        
        // Если все еще ошибка, но не PGRST116, то соединение работает
        const isConnected = !retryError || (retryError.code !== 'PGRST116');
        
        // Обновляем состояние проверки
        supabaseChecked = true;
        supabaseAvailable = isConnected;
        
        // Обновляем кеш
        lastCheckTime = now;
        cachedConnectionResult = isConnected;
        
        return isConnected;
      }
    }
    
    // Если нет ошибки или ошибка не PGRST116, считаем, что соединение работает
    const isConnected = !error || (error.code !== 'PGRST116');
    
    // Обновляем состояние проверки
    supabaseChecked = true;
    supabaseAvailable = isConnected;
    
    // Обновляем кеш
    lastCheckTime = now;
    cachedConnectionResult = isConnected;
    
    if (isConnected) {
      console.log('✅ Соединение с Supabase установлено');
    } else {
      console.warn('⚠️ Не удалось подключиться к Supabase');
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к Supabase:', error);
    
    // Обновляем состояние проверки
    supabaseChecked = true;
    supabaseAvailable = false;
    
    // Обновляем кеш
    lastCheckTime = now;
    cachedConnectionResult = false;
    
    return false;
  }
};

// Сохранение игры в Supabase или локально
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
    let saveSuccess = false;
    
    // Всегда сохраняем копию локально как резервный вариант
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({
        gameData: gameState,
        timestamp: Date.now(),
        userId
      }));
      console.log('✅ Создана локальная резервная копия игры');
      saveSuccess = true;
    } catch (backupError) {
      console.error('❌ Ошибка при создании локальной резервной копии:', backupError);
    }
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      // Предотвращаем многократные уведомления
      if (!supabaseNotificationShown) {
        supabaseNotificationShown = true;
        toast({
          title: "Локальное сохранение",
          description: "Облачное сохранение недоступно. Прогресс сохранен локально.",
          variant: "warning",
        });
      }
      
      return saveSuccess; // Локальное сохранение успешно
    }
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Преобразуем GameState в подходящий для Supabase формат Json
    const gameDataJson = JSON.parse(JSON.stringify(gameState)) as Json;
    
    // Готовим данные для сохранения
    const saveData = {
      user_id: userId,
      game_data: gameDataJson,
      updated_at: new Date().toISOString()
    };
    
    // Пытаемся обновить существующую запись
    const { error: upsertError } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (upsertError) {
      console.error('❌ Ошибка при сохранении в Supabase:', upsertError);
      
      // Показываем уведомление только если оно еще не было показано
      if (!supabaseNotificationShown) {
        supabaseNotificationShown = true;
        toast({
          title: "Частичное сохранение",
          description: "Не удалось сохранить в облаке. Данные сохранены локально.",
          variant: "warning",
        });
      }
      
      return saveSuccess; // Возвращаем результат локального сохранения
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    
    // Сбрасываем флаг уведомлений, так как Supabase стал доступен
    supabaseNotificationShown = false;
    
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    
    // Показываем уведомление только если оно еще не было показано
    if (!supabaseNotificationShown) {
      supabaseNotificationShown = true;
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении. Попробуйте еще раз позже.",
        variant: "destructive",
      });
    }
    
    // Возвращаем true, если есть локальная копия
    return localStorage.getItem(LOCAL_BACKUP_KEY) !== null;
  }
};

// Загрузка игры из Supabase
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Приоритет загрузки:
    // 1. Supabase
    // 2. Локальное хранилище (резервная копия)
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
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
        }
      } else if (data && data.game_data) {
        console.log('✅ Игра загружена из Supabase, дата обновления:', data.updated_at);
        
        // Сбрасываем флаг уведомлений, так как Supabase стал доступен
        supabaseNotificationShown = false;
        
        // Преобразуем данные из Json обратно в GameState
        const gameState = data.game_data as unknown as GameState;
        
        // Проверяем что загружены все необходимые поля
        if (!gameState.resources || !gameState.buildings || !gameState.upgrades) {
          console.warn('⚠️ Загруженные данные неполные или повреждены');
          return null;
        }
        
        // Обновляем локальную копию
        try {
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({
            gameData: gameState,
            timestamp: Date.now(),
            userId
          }));
          console.log('✅ Локальная резервная копия обновлена из Supabase');
        } catch (localError) {
          console.warn('⚠️ Не удалось обновить локальную копию:', localError);
        }
        
        return gameState;
      } else {
        console.log('❌ Сохранение в Supabase не найдено');
      }
    }
    
    // Если данные не загружены из Supabase, пытаемся загрузить из локального хранилища
    try {
      // Проверяем LOCAL_BACKUP_KEY
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        try {
          const localBackup = JSON.parse(backupData);
          console.log('✅ Найдена локальная копия от:', new Date(localBackup.timestamp).toLocaleString());
          
          if (localBackup.gameData) {
            console.log('✅ Игра загружена из локальной копии (LOCAL_BACKUP_KEY)');
            return localBackup.gameData as GameState;
          }
        } catch (parseError) {
          console.error('❌ Ошибка при разборе локальной копии:', parseError);
        }
      }
      
      // Затем проверяем основной ключ GAME_STORAGE_KEY
      const mainData = localStorage.getItem('cryptoCivilizationSave');
      if (mainData) {
        try {
          const mainSave = JSON.parse(mainData);
          console.log('✅ Найдено основное сохранение');
          
          console.log('✅ Игра загружена из основного сохранения (GAME_STORAGE_KEY)');
          return mainSave as GameState;
        } catch (parseError) {
          console.error('❌ Ошибка при разборе основного сохранения:', parseError);
        }
      }
    } catch (backupError) {
      console.error('❌ Ошибка при чтении локальной копии:', backupError);
    }
    
    console.log('❌ Локальная копия не найдена');
    return null;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры:', error);
    return null;
  }
};

// Функция для очистки всех сохранений (для отладки)
export const clearAllSavedData = async (): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    // Очищаем локальное хранилище
    localStorage.removeItem(LOCAL_BACKUP_KEY);
    localStorage.removeItem('cryptoCivilizationSave');
    console.log('✅ Локальное сохранение очищено');
    
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
          title: "Частичная очистка",
          description: "Локальные данные удалены, но не удалось очистить облачное хранилище.",
          variant: "warning",
        });
      } else {
        console.log('✅ Сохранение в Supabase удалено');
        
        toast({
          title: "Сохранения очищены",
          description: "Все сохранения игры успешно удалены.",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Локальная очистка",
        description: "Локальные сохранения удалены. Облачное хранилище недоступно.",
        variant: "warning",
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

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
  }
}
