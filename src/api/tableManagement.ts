
import { supabase } from '@/integrations/supabase/client';

/**
 * Создает таблицы в Supabase если они не существуют
 */
export const createSavesTableIfNotExists = async (): Promise<void> => {
  try {
    // Вызываем функцию создания таблиц на сервере
    const { data, error } = await supabase.rpc('create_saves_table');
    
    if (error) {
      console.error('Ошибка при создании таблиц:', error);
      throw error;
    }
    
    console.log('✅ Проверка и создание таблиц выполнены успешно');
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
    throw error;
  }
};
