
import { supabase } from '@/integrations/supabase/client';

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for Supabase connection'));
      }, 5000); // 5 секунд таймаут
    });
    
    // Выполняем проверку соединения с помощью RPC вместо запроса к несуществующей таблице
    const connectionPromise = supabase
      .rpc('generate_unique_ref_code')
      .then(() => {
        console.log('✅ Соединение с Supabase установлено');
        return true;
      })
      .catch(err => {
        // Даже если функция не существует, но соединение есть, считаем это успехом
        if (err.code === 'PGRST301' || err.message.includes('function') || err.message.includes('does not exist')) {
          console.log('✅ Соединение с Supabase установлено (ошибка функции)');
          return true;
        }
        
        console.error('❌ Ошибка при проверке соединения с Supabase:', err);
        return false;
      }) as Promise<boolean>; // Явное приведение типа
    
    // Используем Promise.race для реализации таймаута
    return await Promise.race([connectionPromise, timeoutPromise])
      .catch(err => {
        console.error('❌ Превышено время ожидания соединения с Supabase:', err);
        return false;
      });
  } catch (error) {
    console.error('❌ Критическая ошибка при проверке соединения с Supabase:', error);
    return false;
  }
};
