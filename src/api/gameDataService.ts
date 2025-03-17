
// API сервис для сохранения и загрузки игрового прогресса с Supabase

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable, forceTelegramCloudSave, forceTelegramCloudLoad } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Флаг, указывающий, что Supabase уже проверен
let supabaseChecked = false;
let supabaseAvailable = false;

// Флаг для отслеживания показа уведомлений
let supabaseNotificationShown = false;

// Получение URL и ключа Supabase
// Используем значения по умолчанию для предотвращения ошибок, если они не заданы
const supabaseUrl = 'https://example.supabase.co';
const supabaseKey = 'dummy-key-for-development';

// Проверка наличия учетных данных Supabase
console.log('ℹ️ Supabase URL и ключ установлены напрямую в gameDataService.ts');

// Создаем клиент Supabase только для локальной разработки
let supabase: SupabaseClient | null = null;
try {
  if (process.env.NODE_ENV === 'development') {
    // В режиме разработки используем заглушку
    supabase = null;
    console.log('ℹ️ Режим разработки: Supabase отключен');
    supabaseChecked = true;
    supabaseAvailable = false;
  } else {
    // В продакшене попытаемся подключиться с настоящими параметрами
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase клиент инициализирован (проверка подключения будет выполнена при первом запросе)');
  }
} catch (error) {
  console.error('❌ Ошибка при инициализации клиента Supabase:', error);
  supabaseChecked = true;
  supabaseAvailable = false;
}

// Имя таблицы для сохранений
const SAVES_TABLE = 'game_saves';

// Имя ключа для локального резервного хранилища
const LOCAL_BACKUP_KEY = 'cryptoCivilizationLocalBackup';

// Имя ключа для Telegram CloudStorage
const TG_CLOUD_KEY = 'cryptoCivilizationSave';

// Дебаунс функция для предотвращения слишком частых проверок
let lastCheckTime = 0;
let cachedConnectionResult = false;

// Получение идентификатора пользователя
const getUserIdentifier = async (): Promise<string> => {
  // Проверяем есть ли сохраненный ID в памяти
  const cachedId = window.__game_user_id;
  if (cachedId) {
    return cachedId;
  }
  
  // Пытаемся получить Telegram ID
  if (isTelegramWebAppAvailable()) {
    try {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe?.user?.id) {
        const id = `tg_${tg.initDataUnsafe.user.id}`;
        window.__game_user_id = id;
        return id;
      }
    } catch (error) {
      console.error('Ошибка при получении Telegram ID:', error);
    }
  }
  
  // Проверяем авторизацию в Supabase
  if (supabase && supabaseAvailable) {
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

// Проверка подключения к Supabase с дебаунсом
const checkSupabaseConnection = async (): Promise<boolean> => {
  // В режиме разработки просто возвращаем false
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  
  // Если уже проверяли - возвращаем кешированный результат
  if (supabaseChecked) {
    return supabaseAvailable;
  }
  
  // Дебаунс: если прошло менее 5 секунд с последней проверки, возвращаем кешированный результат
  const now = Date.now();
  if (now - lastCheckTime < 5000) {
    return cachedConnectionResult;
  }
  
  // Если клиент Supabase не создан, возвращаем false
  if (!supabase) {
    supabaseChecked = true;
    supabaseAvailable = false;
    
    // Обновляем кеш
    lastCheckTime = now;
    cachedConnectionResult = false;
    
    return false;
  }
  
  try {
    // Простой запрос для проверки подключения
    console.log('🔄 Проверка соединения с Supabase...');
    
    // В продакшене делаем реальную проверку
    const { error } = await supabase.from('_dummy_check_').select('*').limit(1).maybeSingle();
    
    // Ошибка PGRST116 означает, что таблица не существует, но соединение работает
    const isConnected = !error || error.code === 'PGRST116';
    
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

// Сохранение в Telegram CloudStorage при доступности
const saveToTelegramCloudStorage = async (gameState: GameState, userId: string): Promise<boolean> => {
  if (!isTelegramWebAppAvailable()) {
    return false;
  }
  
  try {
    console.log('🔄 Попытка сохранения в Telegram CloudStorage...');
    
    // Сериализуем данные с защитой от ошибок
    const jsonData = JSON.stringify({
      gameData: gameState,
      timestamp: Date.now(),
      userId
    });
    
    // Используем вспомогательную функцию для сохранения
    const saved = await forceTelegramCloudSave(jsonData, TG_CLOUD_KEY);
    
    if (saved) {
      console.log('✅ Игра успешно сохранена в Telegram CloudStorage');
    } else {
      console.warn('⚠️ Не удалось сохранить в Telegram CloudStorage');
    }
    
    return saved;
  } catch (error) {
    console.error('❌ Ошибка при сохранении в Telegram CloudStorage:', error);
    return false;
  }
};

// Загрузка из Telegram CloudStorage при доступности
const loadFromTelegramCloudStorage = async (): Promise<GameState | null> => {
  if (!isTelegramWebAppAvailable()) {
    return null;
  }
  
  try {
    console.log('🔄 Попытка загрузки из Telegram CloudStorage...');
    
    // Используем вспомогательную функцию для загрузки
    const jsonData = await forceTelegramCloudLoad(TG_CLOUD_KEY);
    
    if (jsonData) {
      try {
        const parsedData = JSON.parse(jsonData);
        if (parsedData && parsedData.gameData) {
          console.log('✅ Игра успешно загружена из Telegram CloudStorage');
          return parsedData.gameData as GameState;
        }
      } catch (parseError) {
        console.error('❌ Ошибка при разборе данных из Telegram CloudStorage:', parseError);
      }
    }
    
    console.warn('⚠️ Данные в Telegram CloudStorage не найдены или повреждены');
    return null;
  } catch (error) {
    console.error('❌ Ошибка при загрузке из Telegram CloudStorage:', error);
    return null;
  }
};

// Сохранение игры в Supabase
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
    
    // В режиме Telegram сначала пытаемся сохранить в CloudStorage
    if (isTelegramWebAppAvailable()) {
      const tgSaved = await saveToTelegramCloudStorage(gameState, userId);
      if (tgSaved) {
        return true;
      }
    }
    
    // В режиме разработки сразу возвращаем успех локального сохранения
    if (process.env.NODE_ENV === 'development') {
      return saveSuccess;
    }
    
    // Если доступен Supabase, проверяем подключение
    if (supabase) {
      // Проверяем подключение к Supabase
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        // Предотвращаем многократные уведомления (кроме режима разработки)
        if (!supabaseNotificationShown && process.env.NODE_ENV !== 'development') {
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
      
      // Проверка существования таблицы и создание, если не существует
      const { error: tableCheckError } = await supabase.from(SAVES_TABLE).select('id').limit(1);
      if (tableCheckError && tableCheckError.code === 'PGRST116') {
        // Таблица не существует, создаем ее
        console.log('❌ Таблица не найдена. Будет создана автоматически при первом сохранении.');
      }
      
      // Пытаемся обновить существующую запись
      const { error: updateError } = await supabase
        .from(SAVES_TABLE)
        .update({
          game_data: gameState,
          updated_at: new Date().toISOString()
        })
        .match({ user_id: userId });
      
      // Если запись не существует или произошла другая ошибка, создаем новую запись
      if (updateError) {
        console.log('Сохранение не найдено или ошибка обновления, создаем новую запись.');
        
        const { error: insertError } = await supabase
          .from(SAVES_TABLE)
          .insert({
            user_id: userId,
            game_data: gameState,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('❌ Ошибка при создании новой записи:', insertError);
          
          // Показываем уведомление только если оно еще не было показано
          if (!supabaseNotificationShown && process.env.NODE_ENV !== 'development') {
            supabaseNotificationShown = true;
            toast({
              title: "Частичное сохранение",
              description: "Не удалось сохранить в облаке. Данные сохранены локально.",
              variant: "warning",
            });
          }
          
          return saveSuccess; // Возвращаем результат локального сохранения
        }
      }
      
      console.log('✅ Игра успешно сохранена в Supabase');
      
      // Сбрасываем флаг уведомлений, так как Supabase стал доступен
      supabaseNotificationShown = false;
      
      return true;
    }
    
    // Показываем уведомление только если оно еще не было показано в продакшене
    if (!supabaseNotificationShown && process.env.NODE_ENV !== 'development') {
      supabaseNotificationShown = true;
      toast({
        title: "Локальное сохранение",
        description: "Облачное сохранение недоступно. Прогресс сохранен локально.",
        variant: "warning",
      });
    }
    
    return saveSuccess; // Возвращаем результат локального сохранения
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    
    // Показываем уведомление только если оно еще не было показано в продакшене
    if (!supabaseNotificationShown && process.env.NODE_ENV !== 'development') {
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
    
    // В режиме Telegram сначала пытаемся загрузить из CloudStorage
    if (isTelegramWebAppAvailable()) {
      const tgData = await loadFromTelegramCloudStorage();
      if (tgData) {
        console.log('✅ Игра загружена из Telegram CloudStorage');
        return tgData;
      } else {
        console.log('⚠️ Не удалось загрузить из Telegram CloudStorage');
      }
    }
    
    // В режиме разработки сразу переходим к локальному хранилищу
    if (process.env.NODE_ENV === 'development') {
      // Пропускаем проверку Supabase в режиме разработки
    } else if (supabase) {
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
          
          return data.game_data as GameState;
        } else {
          console.log('❌ Сохранение в Supabase не найдено');
        }
      }
    }
    
    // Если данные не загружены из других источников, пытаемся загрузить из локального хранилища
    try {
      // Сначала проверяем LOCAL_BACKUP_KEY
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        const localBackup = JSON.parse(backupData);
        console.log('✅ Найдена локальная копия от:', new Date(localBackup.timestamp).toLocaleString());
        
        if (localBackup.gameData) {
          console.log('✅ Игра загружена из локальной копии (из LOCAL_BACKUP_KEY)');
          return localBackup.gameData;
        }
      }
      
      // Затем проверяем основной ключ GAME_STORAGE_KEY
      const mainData = localStorage.getItem('cryptoCivilizationSave');
      if (mainData) {
        const mainSave = JSON.parse(mainData);
        console.log('✅ Найдено основное сохранение');
        
        console.log('✅ Игра загружена из основного сохранения (GAME_STORAGE_KEY)');
        return mainSave;
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
    
    // Очищаем Telegram CloudStorage если доступно
    if (isTelegramWebAppAvailable()) {
      try {
        if (window.Telegram?.WebApp?.CloudStorage?.removeItem) {
          await window.Telegram.WebApp.CloudStorage.removeItem(TG_CLOUD_KEY);
          console.log('✅ Telegram CloudStorage очищен');
        }
      } catch (tgError) {
        console.error('❌ Ошибка при очистке Telegram CloudStorage:', tgError);
      }
    }
    
    // В режиме разработки ничего больше не делаем
    if (process.env.NODE_ENV === 'development') {
      toast({
        title: "Сохранения очищены",
        description: "Локальные сохранения успешно удалены.",
        variant: "default",
      });
      return;
    }
    
    // Если доступен Supabase, удаляем запись из базы данных
    if (supabase) {
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
    __telegramInitialized?: boolean;
    __telegramNotificationShown?: boolean;
  }
}
