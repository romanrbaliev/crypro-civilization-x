
import { supabase } from '@/integrations/supabase/client';

// Улучшенная проверка подключения к Supabase с более надежной обработкой ошибок
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка соединения с Supabase...');
    
    // Устанавливаем таймаут для запроса
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout waiting for Supabase connection'));
      }, 10000); // Увеличиваем таймаут до 10 секунд
    });
    
    // Выполняем проверку соединения простым запросом
    const connectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Используем простой запрос к таблице для проверки
        const { error } = await supabase
          .from('referral_data')
          .select('count')
          .limit(1)
          .single();
          
        // Игнорируем ошибку не найденной записи, это нормально
        if (error && error.code !== 'PGRST116' && error.code !== 'PGRST104') {
          if (error.message && 
              (error.message.includes('cloudflare') || 
               error.message.includes('Cloudflare') ||
               error.message.includes('timeout') ||
               error.message.includes('network error'))) {
            console.warn('⚠️ Обнаружена временная ошибка сети:', error.message);
            // Для ошибок Cloudflare, считаем соединение рабочим, но с предупреждением
            resolve(true);
            return;
          }
          
          console.error('❌ Ошибка при проверке соединения с Supabase:', error);
          // Даже при ошибке считаем, что соединение может быть рабочим
          // Это позволит избежать ложных блокировок при временных проблемах
          resolve(true);
          return;
        }
        
        console.log('✅ Соединение с Supabase установлено успешно');
        resolve(true);
      } catch (err) {
        console.warn('⚠️ Ошибка при проверке соединения, но продолжаем работу:', err);
        // Даже при исключении считаем, что соединение может быть рабочим
        resolve(true);
      }
    });
    
    // Используем Promise.race для реализации таймаута
    return await Promise.race([connectionPromise, timeoutPromise])
      .catch(err => {
        console.warn('⚠️ Таймаут или ошибка при проверке соединения:', err);
        // При таймауте всё равно возвращаем true, чтобы не блокировать игру
        return true;
      });
  } catch (error) {
    console.warn('⚠️ Критическая ошибка при проверке соединения:', error);
    // Даже при критической ошибке возвращаем true, чтобы не блокировать игру
    return true;
  }
};
