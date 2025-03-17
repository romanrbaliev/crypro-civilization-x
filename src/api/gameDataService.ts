
// API сервис для сохранения и загрузки игрового прогресса с Supabase

import { GameState } from '@/context/types';
import { isTelegramWebAppAvailable } from '@/utils/helpers';
import { toast } from "@/hooks/use-toast";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Получение URL и ключа Supabase (должны быть доступны, так как Supabase подключен)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Проверка наличия учетных данных Supabase
if (!supabaseUrl || !supabaseKey) {
  console.error('Не найдены учетные данные Supabase. Проверьте подключение Supabase в настройках проекта.');
}

// Создаем клиент Supabase
let supabase: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase клиент инициализирован успешно');
  } else {
    console.warn('⚠️ Не удалось инициализировать Supabase: отсутствуют учетные данные');
  }
} catch (error) {
  console.error('❌ Ошибка при инициализации клиента Supabase:', error);
}

// Имя таблицы для сохранений
const SAVES_TABLE = 'game_saves';

// Имя ключа для локального резервного хранилища
const LOCAL_BACKUP_KEY = 'cryptoCivilizationLocalBackup';

// Получение идентификатора пользователя
const getUserIdentifier = async (): Promise<string> => {
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
  
  // Проверяем авторизацию в Supabase
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        return `sb_${user.id}`;
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
  
  return localId;
};

// Проверка подключения к Supabase
const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    // Простой запрос для проверки подключения
    const { error } = await supabase.from('_dummy_check_').select('*').limit(1).maybeSingle();
    
    // Ошибка PGRST116 означает, что таблица не существует, но соединение работает
    if (error && error.code === 'PGRST116') {
      return true;
    }
    
    return !error;
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к Supabase:', error);
    return false;
  }
};

// Сохранение игры в Supabase
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
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
    
    // Если доступен Supabase, проверяем подключение
    if (supabase) {
      console.log('🔄 Проверка подключения к Supabase...');
      
      // Проверяем подключение к Supabase
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        console.warn('⚠️ Supabase недоступен, используется только локальное хранилище');
        
        toast({
          title: "Локальное сохранение",
          description: "Supabase недоступен. Прогресс сохранен локально.",
          variant: "warning",
        });
        
        return true; // Локальное сохранение успешно
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
          
          // При ошибке сохранения в Supabase используем только локальное хранилище
          toast({
            title: "Частичное сохранение",
            description: "Не удалось сохранить в облаке. Данные сохранены локально.",
            variant: "warning",
          });
          
          return true; // Возвращаем true, так как локальное сохранение успешно
        }
      }
      
      console.log('✅ Игра успешно сохранена в Supabase');
      
      toast({
        title: "Игра сохранена",
        description: "Прогресс сохранен в облачном хранилище",
        variant: "default",
      });
      
      return true;
    } else {
      console.warn('⚠️ Supabase недоступен, используется только локальное хранилище');
      
      toast({
        title: "Локальное сохранение",
        description: "Supabase недоступен. Прогресс сохранен локально.",
        variant: "warning",
      });
      
      return true; // Возвращаем true, так как локальное сохранение успешно
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    
    toast({
      title: "Ошибка сохранения",
      description: "Произошла ошибка при сохранении. Попробуйте еще раз позже.",
      variant: "destructive",
    });
    
    // Возвращаем true, если есть локальная копия
    return localStorage.getItem(LOCAL_BACKUP_KEY) !== null;
  }
};

// Загрузка игры из Supabase
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Загрузка игры для пользователя: ${userId}`);
    
    // Если доступен Supabase, пытаемся загрузить из базы данных
    if (supabase) {
      console.log('🔄 Проверка подключения к Supabase...');
      
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
          
          toast({
            title: "Игра загружена",
            description: "Прогресс загружен из облачного хранилища",
            variant: "default",
          });
          
          return data.game_data as GameState;
        } else {
          console.log('❌ Сохранение в Supabase не найдено');
        }
      } else {
        console.warn('⚠️ Supabase недоступен, используется только локальное хранилище');
      }
    } else {
      console.warn('⚠️ Supabase недоступен, используется только локальное хранилище');
    }
    
    // Если данные не загружены из Supabase, пытаемся загрузить из локального хранилища
    try {
      const backupData = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (backupData) {
        const localBackup = JSON.parse(backupData);
        console.log('✅ Найдена локальная копия от:', new Date(localBackup.timestamp).toLocaleString());
        
        if (localBackup.gameData) {
          console.log('✅ Игра загружена из локальной копии');
          
          toast({
            title: "Игра загружена",
            description: "Прогресс загружен из локального хранилища",
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
export const clearAllSavedData = async (): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    // Очищаем локальное хранилище
    localStorage.removeItem(LOCAL_BACKUP_KEY);
    console.log('✅ Локальное сохранение очищено');
    
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
        console.warn('⚠️ Supabase недоступен, очищено только локальное хранилище');
        
        toast({
          title: "Локальная очистка",
          description: "Локальные сохранения удалены. Supabase недоступен.",
          variant: "warning",
        });
      }
    } else {
      console.warn('⚠️ Supabase недоступен, очищено только локальное хранилище');
      
      toast({
        title: "Локальная очистка",
        description: "Локальные сохранения удалены. Supabase недоступен.",
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
