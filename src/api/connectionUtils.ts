
// Утилиты для работы с соединением

import { supabase } from '@/integrations/supabase/client';
import { createSavesTableIfNotExists } from './tableManagement';
import { CHECK_CONNECTION_INTERVAL } from './apiTypes';

// Кэш для проверки соединения
let lastCheckTime = 0;
let cachedConnectionResult = false;

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  // Дебаунс: если прошло менее 5 секунд с последней проверки, возвращаем кешированный результат
  const now = Date.now();
  if (now - lastCheckTime < CHECK_CONNECTION_INTERVAL) {
    return cachedConnectionResult;
  }
  
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Простая проверка на доступность API
    const { data, error } = await supabase.auth.getSession();
    
    // Соединение работает, если нет ошибки
    const isConnected = !error;
    
    lastCheckTime = now;
    cachedConnectionResult = isConnected;
    
    if (isConnected) {
      console.log('✅ Соединение с Supabase установлено');
      
      // Проверяем, нужно ли создать таблицы
      await createSavesTableIfNotExists();
    } else {
      console.warn('⚠️ Не удалось подключиться к Supabase:', error);
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения к Supabase:', error);
    
    lastCheckTime = now;
    cachedConnectionResult = false;
    
    return false;
  }
};
