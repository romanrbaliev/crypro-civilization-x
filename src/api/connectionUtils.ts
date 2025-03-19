
import { supabase } from '@/integrations/supabase/client';

// Проверка подключения к Supabase с улучшенной обработкой ошибок
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for Supabase connection'));
      }, 7000); // Увеличиваем таймаут до 7 секунд
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
          if (error.message && 
              (error.message.includes('cloudflare') || 
               error.message.includes('Cloudflare') ||
               error.message.includes('timeout') ||
               error.message.includes('network error'))) {
            console.error('❌ Обнаружена ошибка Cloudflare или сети:', error.message);
            throw new Error(`cloudflare: ${error.message}`);
          }
          
          console.error('❌ Ошибка при проверке соединения с Supabase:', error);
          resolve(false);
          return;
        }
        
        console.log('✅ Соединение с Supabase установлено');
        resolve(true);
      } catch (err) {
        if (err instanceof Error && 
            (err.message.includes('cloudflare') || 
             err.message.includes('Cloudflare') ||
             err.message.includes('timeout') ||
             err.message.includes('network error'))) {
          console.error('❌ Обнаружена ошибка Cloudflare или сети:', err.message);
          throw err; // Пробрасываем ошибку дальше для специальной обработки
        }
        
        console.error('❌ Ошибка при проверке соединения с Supabase:', err);
        resolve(false);
      }
    });
    
    // Используем Promise.race для реализации таймаута
    return await Promise.race([connectionPromise, timeoutPromise])
      .catch(err => {
        if (err instanceof Error && 
            (err.message.includes('cloudflare') || 
             err.message.includes('Cloudflare') ||
             err.message.includes('timeout'))) {
          console.error('❌ Обнаружена ошибка Cloudflare или таймаута:', err.message);
          throw err; // Пробрасываем ошибку Cloudflare дальше
        }
        
        console.error('❌ Превышено время ожидания соединения с Supabase:', err);
        return false;
      });
  } catch (error) {
    // Проверяем, является ли ошибка связанной с Cloudflare
    if (error instanceof Error && 
        (error.message.includes('cloudflare') || 
         error.message.includes('Cloudflare') ||
         error.message.includes('timeout') ||
         error.message.includes('network error'))) {
      console.error('❌ Критическая ошибка Cloudflare:', error.message);
      throw error; // Пробрасываем ошибку Cloudflare для специальной обработки
    }
    
    console.error('❌ Критическая ошибка при проверке соединения с Supabase:', error);
    return false;
  }
};
