
import { supabase } from '@/integrations/supabase/client';

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<false>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for Supabase connection'));
      }, 5000); // 5 секунд таймаут
    });
    
    // Выполняем простой запрос для проверки соединения
    const connectionPromise = supabase
      .from('_unused_table_for_connection_check')
      .select('count')
      .limit(1)
      .then(() => {
        console.log('✅ Соединение с Supabase установлено');
        return true;
      })
      .catch(err => {
        // Проверяем, связана ли ошибка с отсутствием таблицы (что нормально)
        if (err.code === 'PGRST116' || err.message.includes('relation') || err.message.includes('does not exist')) {
          console.log('✅ Соединение с Supabase установлено (ошибка о несуществующей таблице)');
          return true;
        }
        
        console.error('❌ Ошибка при проверке соединения с Supabase:', err);
        return false;
      });
    
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
