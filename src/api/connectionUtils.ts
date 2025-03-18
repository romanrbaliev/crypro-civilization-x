
import { supabase } from '@/integrations/supabase/client';

// Проверка подключения к Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        console.log('⏱️ Превышено время ожидания соединения с Supabase');
        reject(new Error('Timeout waiting for Supabase connection'));
      }, 5000); // 5 секунд таймаут
    });
    
    // Выполняем проверку соединения простым запросом
    const connectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Используем простой запрос к таблице referral_data
        const { data, error } = await supabase
          .from('referral_data')
          .select('user_id')
          .limit(1);
          
        if (error) {
          console.error('❌ Ошибка при проверке соединения с Supabase:', error);
          resolve(false);
          return;
        }
        
        console.log('✅ Соединение с Supabase установлено');
        resolve(true);
      } catch (err) {
        console.error('❌ Ошибка при проверке соединения с Supabase:', err);
        resolve(false);
      }
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
