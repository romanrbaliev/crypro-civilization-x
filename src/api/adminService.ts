
// Административные функции для отладки и управления данными

import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { checkSupabaseConnection } from './connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { toast } from "@/hooks/use-toast";
import { SAVES_TABLE, REFERRAL_TABLE, REFERRAL_HELPERS_TABLE } from './apiTypes';

// Функция для очистки всех сохранений (для отладки)
export const clearAllSavedData = async (): Promise<void> => {
  try {
    const userId = await getUserIdentifier();
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
      console.log('🔄 Удаление сохранения из Supabase...');
      
      const { error } = await supabase
        .from(SAVES_TABLE)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Ошибка при удалении сохранения из Supabase:', error);
        
        toast({
          title: "Ошибка очистки",
          description: "Не удалось очистить сохранения.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Сохранение в Supabase удалено');
        
        // Очищаем также локальное хранилище
        localStorage.removeItem('crypto_civ_user_id');
        
        toast({
          title: "Сохранения очищены",
          description: "Все сохранения игры успешно удалены.",
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к серверу для очистки сохранений.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке сохранений:', error);
    
    toast({
      title: "Ошибка очистки",
      description: "Произошла ошибка при удалении сохранений.",
      variant: "destructive",
    });
  }
};

// НОВАЯ ФУНКЦИЯ: Удаление всех сохранений для всех пользователей (для администратора)
export const clearAllSavedDataForAllUsers = async (): Promise<void> => {
  try {
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (isConnected) {
      console.log('🔄 Удаление ВСЕХ сохранений из Supabase...');
      
      // Удаляем все записи из таблицы сохранений
      const { error: savesError } = await supabase
        .from(SAVES_TABLE)
        .delete()
        .neq('user_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      // Удаляем все записи из таблицы помощников
      const { error: helpersError } = await supabase
        .from(REFERRAL_HELPERS_TABLE)
        .delete()
        .neq('helper_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      // Удаляем все записи из таблицы рефералов
      const { error: referralsError } = await supabase
        .from(REFERRAL_TABLE)
        .delete()
        .neq('user_id', 'DUMMY_ID_THAT_DOESNT_EXIST');
      
      if (savesError || helpersError || referralsError) {
        console.error('❌ Ошибки при удалении данных:', { 
          savesError, helpersError, referralsError 
        });
        
        toast({
          title: "Ошибка очистки",
          description: "Не удалось очистить все сохранения.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Все сохранения в Supabase удалены');
        
        // Очищаем также локальное хранилище текущего пользователя
        localStorage.removeItem('crypto_civ_user_id');
        
        toast({
          title: "Все сохранения очищены",
          description: "Все данные игры для всех пользователей успешно удалены.",
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к серверу для очистки сохранений.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке всех сохранений:', error);
    
    toast({
      title: "Ошибка очистки",
      description: "Произошла ошибка при удалении всех сохранений.",
      variant: "destructive",
    });
  }
};
