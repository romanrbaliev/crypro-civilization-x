
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '../connectionUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Обновляет статус запроса помощника в базе данных
 * @param helperId ID помощника
 * @param status Новый статус запроса
 * @param buildingId ID здания (опционально для принятых запросов)
 */
export const updateHelperRequestStatus = async (
  helperId: string, 
  status: 'pending' | 'accepted' | 'rejected',
  buildingId?: string
): Promise<boolean> => {
  try {
    console.log(`Обновление статуса помощника в БД: helperId=${helperId}, status=${status}, buildingId=${buildingId || 'не указано'}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при обновлении статуса помощника');
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к базе данных",
        variant: "destructive"
      });
      return false;
    }
    
    // Обновляем запись в таблице helper_requests
    const { data, error } = await supabase
      .from('helper_requests')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('helper_id', helperId)
      .select();
      
    if (error) {
      console.error('❌ Ошибка при обновлении статуса помощника:', error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить статус помощника в базе данных",
        variant: "destructive"
      });
      return false;
    }
    
    console.log(`✅ Статус помощника успешно обновлен в БД:`, data);
    
    // Если запрос принят, обновляем информацию о реферале
    if (status === 'accepted' && buildingId) {
      const { error: referralError } = await supabase
        .from('referral_data')
        .update({ 
          hired: true,
          assigned_building_id: buildingId 
        })
        .eq('user_id', helperId);
        
      if (referralError) {
        console.error('❌ Ошибка при обновлении статуса занятости реферала:', referralError);
        toast({
          title: "Внимание",
          description: "Статус помощника обновлен, но не удалось обновить статус занятости",
          variant: "warning"
        });
        return true; // Возвращаем true, т.к. основная операция выполнена успешно
      }
      
      console.log(`✅ Статус занятости реферала успешно обновлен в БД для ${helperId}`);
      toast({
        title: "Статус обновлен",
        description: "Информация о помощнике успешно обновлена в базе данных",
        variant: "success"
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Неожиданная ошибка при обновлении статуса помощника:', error);
    toast({
      title: "Ошибка системы",
      description: "Произошла неожиданная ошибка при обновлении статуса",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Получает список запросов помощников для пользователя
 * @param userId ID пользователя
 */
export const getHelperRequests = async (userId: string) => {
  try {
    console.log(`Запрос списка помощников для пользователя: ${userId}`);
    
    // Проверяем соединение с Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Нет соединения с Supabase при получении списка помощников');
      return { success: false, helpers: [] };
    }
    
    // Получаем список запросов, где пользователь является помощником
    const { data, error } = await supabase
      .from('helper_requests')
      .select('*')
      .eq('helper_id', userId);
      
    if (error) {
      console.error('❌ Ошибка при получении списка запросов помощников:', error);
      return { success: false, helpers: [] };
    }
    
    console.log(`✅ Получен список запросов помощников:`, data);
    return { success: true, helpers: data || [] };
  } catch (error) {
    console.error('❌ Неожиданная ошибка при получении списка помощников:', error);
    return { success: false, helpers: [] };
  }
};
