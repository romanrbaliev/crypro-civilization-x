
// API сервис для сохранения и загрузки игрового прогресса с Supabase

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

// Флаги состояния
let supabaseChecked = false;
let supabaseAvailable = false;
let supabaseNotificationShown = false;

// Константы
const SAVES_TABLE = 'game_saves';
const LOCAL_BACKUP_KEY = 'cryptoCivilizationLocalBackup';
const LAST_CHECK_INTERVAL = 5000; // 5 секунд между проверками соединения

// Кэш для проверки соединения
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
  
  // Используем локальный идентификатор из localStorage
  let localId = localStorage.getItem('game_user_id');
  if (!localId) {
    localId = `local_${Math.random().toString(36).substring(2, 15)}`;
    try {
      localStorage.setItem('game_user_id', localId);
    } catch (e) {
      console.warn('⚠️ Не удалось сохранить локальный ID в localStorage:', e);
    }
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
  if (now - lastCheckTime < LAST_CHECK_INTERVAL) {
    return cachedConnectionResult;
  }
  
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Простая проверка на доступность базы
    const { error } = await supabase
      .from(SAVES_TABLE)
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠️ Таблица сохранений не найдена, пробуем создать...');
      
      // Создаем таблицу через RPC
      const { error: createError } = await supabase.rpc('create_saves_table');
      
      if (createError) {
        console.error('❌ Не удалось создать таблицу:', createError);
        
        // Проверяем еще раз
        const { error: retryError } = await supabase
          .from(SAVES_TABLE)
          .select('count')
          .limit(1);
        
        const isConnected = !retryError || (retryError.code !== 'PGRST116');
        supabaseChecked = true;
        supabaseAvailable = isConnected;
        lastCheckTime = now;
        cachedConnectionResult = isConnected;
        
        return isConnected;
      }
      
      // Если таблица успешно создана
      console.log('✅ Таблица сохранений успешно создана');
      supabaseChecked = true;
      supabaseAvailable = true;
      lastCheckTime = now;
      cachedConnectionResult = true;
      
      return true;
    }
    
    // Подключение работает если нет ошибки или ошибка не связана с отсутствием таблицы
    const isConnected = !error || (error.code !== 'PGRST116');
    supabaseChecked = true;
    supabaseAvailable = isConnected;
    lastCheckTime = now;
    cachedConnectionResult = isConnected;
    
    if (isConnected) {
      console.log('✅ Соединение с Supabase установлено');
    } else {
      console.warn('⚠️ Не удалось подключиться к Supabase:', error);
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к Supabase:', error);
    
    supabaseChecked = true;
    supabaseAvailable = false;
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
        safeDispatchGameEvent(
          "Облачное сохранение недоступно. Прогресс сохранен локально.", 
          "warning"
        );
      }
      
      return saveSuccess; // Локальное сохранение успешно
    }
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Преобразуем GameState в Json с полной проверкой
    // Строго контролируем преобразование типов
    let gameDataJson: Json;
    try {
      // Используем JSON.stringify и JSON.parse для преобразования в корректный тип Json
      const jsonString = JSON.stringify(gameState);
      gameDataJson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Ошибка преобразования состояния игры в JSON:', parseError);
      return saveSuccess; // Возвращаем результат локального сохранения
    }
    
    // Готовим данные для сохранения
    const saveData = {
      user_id: userId,
      game_data: gameDataJson,
      updated_at: new Date().toISOString()
    };
    
    console.log('👉 Данные для сохранения в Supabase:', saveData);
    
    // Пытаемся обновить существующую запись с явным преобразованием типов
    const { error: upsertError } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (upsertError) {
      console.error('❌ Ошибка при сохранении в Supabase:', upsertError);
      
      if (!supabaseNotificationShown) {
        supabaseNotificationShown = true;
        toast({
          title: "Частичное сохранение",
          description: "Не удалось сохранить в облаке. Данные сохранены локально.",
          variant: "warning",
        });
        safeDispatchGameEvent(
          "Не удалось сохранить в облаке. Данные сохранены локально.",
          "warning"
        );
      }
      
      return saveSuccess;
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    
    // Сбрасываем флаг уведомлений, так как Supabase стал доступен
    if (supabaseNotificationShown) {
      supabaseNotificationShown = false;
      safeDispatchGameEvent(
        "Подключение к облаку восстановлено. Данные синхронизированы.",
        "success"
      );
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    
    if (!supabaseNotificationShown) {
      supabaseNotificationShown = true;
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении. Попробуйте еще раз позже.",
        variant: "destructive",
      });
      safeDispatchGameEvent(
        "Произошла ошибка при сохранении. Попробуйте еще раз позже.",
        "error"
      );
    }
    
    // Возвращаем true, если есть локальная копия
    return localStorage.getItem(LOCAL_BACKUP_KEY) !== null;
  }
};

// Загрузка игры из Supabase или локального хранилища
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
      console.log('🔄 Загрузка из Supabase...');
      
      try {
        const { data, error } = await supabase
          .from(SAVES_TABLE)
          .select('game_data, updated_at')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('❌ Ошибка при загрузке из Supabase:', error);
          
          if (error.code === 'PGRST116') {
            console.warn('⚠️ Таблица сохранений не существует в Supabase');
            safeDispatchGameEvent(
              "Таблица сохранений не найдена в облаке.",
              "warning"
            );
          }
        } else if (data && data.game_data) {
          console.log('✅ Игра загружена из Supabase, дата обновления:', data.updated_at);
          console.log('👉 Данные из Supabase:', JSON.stringify(data.game_data).substring(0, 100) + '...');
          
          try {
            // Строгое преобразование типа с проверкой структуры
            const gameState = data.game_data as any;
            
            // Проверка целостности данных
            if (validateGameState(gameState)) {
              console.log('✅ Проверка целостности данных из Supabase пройдена');
              
              // Обновляем локальную копию для резерва
              try {
                localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({
                  gameData: gameState,
                  timestamp: Date.now(),
                  userId
                }));
                console.log('✅ Локальная резервная копия обновлена из Supabase');
                
                safeDispatchGameEvent(
                  "Игра успешно загружена из облачного хранилища.",
                  "success"
                );
                
                // Добавляем поля lastUpdate и lastSaved, если их нет
                if (!gameState.lastUpdate) {
                  gameState.lastUpdate = Date.now();
                }
                if (!gameState.lastSaved) {
                  gameState.lastSaved = Date.now();
                }
                
                return gameState;
              } catch (localError) {
                console.warn('⚠️ Не удалось обновить локальную копию:', localError);
              }
              
              return gameState;
            } else {
              console.error('❌ Проверка целостности данных из Supabase не пройдена');
              safeDispatchGameEvent(
                "Данные из облака повреждены. Попытка восстановления из локальной копии.",
                "warning"
              );
            }
          } catch (parseError) {
            console.error('❌ Ошибка при обработке данных из Supabase:', parseError);
          }
        } else {
          console.log('❌ Сохранение в Supabase не найдено');
        }
      } catch (supabaseError) {
        console.error('❌ Критическая ошибка при работе с Supabase:', supabaseError);
      }
    }
    
    // Если данные не загружены из Supabase, пытаемся загрузить из локального хранилища
    try {
      console.log('🔄 Попытка загрузки из локального хранилища...');
      
      // Сначала проверяем LOCAL_BACKUP_KEY (основное резервное хранилище)
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        try {
          const localBackup = JSON.parse(backupData);
          console.log('✅ Найдена локальная копия от:', new Date(localBackup.timestamp).toLocaleString());
          
          if (localBackup.gameData) {
            const gameState = localBackup.gameData;
            
            // Проверка целостности данных
            if (validateGameState(gameState)) {
              console.log('✅ Проверка целостности данных из локальной копии пройдена');
              safeDispatchGameEvent(
                "Игра загружена из локальной копии.",
                "info"
              );
              
              // Добавляем поля lastUpdate и lastSaved, если их нет
              if (!gameState.lastUpdate) {
                gameState.lastUpdate = Date.now();
              }
              if (!gameState.lastSaved) {
                gameState.lastSaved = Date.now();
              }
              
              return gameState;
            } else {
              console.error('❌ Проверка целостности данных из локальной копии не пройдена');
            }
          }
        } catch (parseError) {
          console.error('❌ Ошибка при разборе локальной копии:', parseError);
        }
      }
      
      // Затем проверяем GAME_STORAGE_KEY (базовое хранилище)
      const mainData = localStorage.getItem('cryptoCivilizationSave');
      if (mainData) {
        try {
          const mainSave = JSON.parse(mainData);
          console.log('✅ Найдено основное сохранение');
          
          // Проверка целостности данных
          if (validateGameState(mainSave)) {
            console.log('✅ Проверка целостности данных из основного сохранения пройдена');
            safeDispatchGameEvent(
              "Игра загружена из основного сохранения.",
              "info"
            );
            
            // Добавляем поля lastUpdate и lastSaved, если их нет
            if (!mainSave.lastUpdate) {
              mainSave.lastUpdate = Date.now();
            }
            if (!mainSave.lastSaved) {
              mainSave.lastSaved = Date.now();
            }
            
            return mainSave;
          } else {
            console.error('❌ Проверка целостности данных из основного сохранения не пройдена');
          }
        } catch (parseError) {
          console.error('❌ Ошибка при разборе основного сохранения:', parseError);
        }
      }
    } catch (backupError) {
      console.error('❌ Ошибка при чтении локальной копии:', backupError);
    }
    
    console.log('❌ Ни одно сохранение не найдено или все сохранения повреждены');
    safeDispatchGameEvent(
      "Сохранения не найдены. Начинаем новую игру.",
      "info"
    );
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке игры:', error);
    safeDispatchGameEvent(
      "Критическая ошибка при загрузке игры. Начинаем новую игру.",
      "error"
    );
    return null;
  }
};

// Валидация структуры данных игры
function validateGameState(state: any): boolean {
  if (!state) return false;
  
  // Проверяем наличие ключевых полей
  const requiredFields = ['resources', 'buildings', 'upgrades', 'unlocks'];
  for (const field of requiredFields) {
    if (!state[field] || typeof state[field] !== 'object') {
      console.error(`❌ Отсутствует или некорректно поле ${field}`);
      return false;
    }
  }
  
  // Проверяем наличие ключевых ресурсов
  if (!state.resources.knowledge || !state.resources.usdt) {
    console.error('❌ Отсутствуют базовые ресурсы knowledge или usdt');
    return false;
  }
  
  return true;
}

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
        safeDispatchGameEvent(
          "Локальные данные удалены, но не удалось очистить облачное хранилище.",
          "warning"
        );
      } else {
        console.log('✅ Сохранение в Supabase удалено');
        
        toast({
          title: "Сохранения очищены",
          description: "Все сохранения игры успешно удалены.",
          variant: "default",
        });
        safeDispatchGameEvent(
          "Все сохранения игры успешно удалены.",
          "success"
        );
      }
    } else {
      toast({
        title: "Локальная очистка",
        description: "Локальные сохранения удалены. Облачное хранилище недоступно.",
        variant: "warning",
      });
      safeDispatchGameEvent(
        "Локальные сохранения удалены. Облачное хранилище недоступно.",
        "warning"
      );
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке сохранений:', error);
    
    toast({
      title: "Ошибка очистки",
      description: "Произошла ошибка при удалении сохранений.",
      variant: "destructive",
    });
    safeDispatchGameEvent(
      "Произошла ошибка при удалении сохранений.",
      "error"
    );
  }
};

// Глобальное объявление типа для window
declare global {
  interface Window {
    __game_user_id?: string;
  }
}
