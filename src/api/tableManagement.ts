
// Управление таблицами в базе данных

import { supabase } from '@/integrations/supabase/client';
import { SAVES_TABLE } from './apiTypes';

// Создание SQL функции для создания таблицы если она не существует
export const createSavesTableIfNotExists = async (): Promise<boolean> => {
  try {
    console.log('🔄 Проверка существования и создание таблицы сохранений если необходима...');
    
    // Вызываем функцию create_saves_table, которая создаст таблицы если они не существуют
    const { error } = await supabase.rpc('create_saves_table');
    
    if (error) {
      console.error('❌ Ошибка при создании таблицы сохранений:', error);
      
      // Проверяем существование таблицы напрямую
      const { error: checkError } = await supabase.from(SAVES_TABLE).select('count').limit(1);
      if (!checkError) {
        console.log('✅ Таблица сохранений уже существует');
        return true;
      }
      
      return false;
    }
    
    console.log('✅ Таблица сохранений успешно создана или уже существует');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании таблицы сохранений:', error);
    return false;
  }
};
