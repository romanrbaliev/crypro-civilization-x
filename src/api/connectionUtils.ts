
import { supabase } from '@/integrations/supabase/client';

/**
 * Проверяет соединение с Supabase
 * @returns true если соединение установлено
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('referral_data').select('count(*)', { count: 'exact', head: true }).limit(1);
    
    if (error) {
      console.error('❌ Ошибка при проверке соединения с Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при проверке соединения с Supabase:', error);
    return false;
  }
};
