
import { supabase } from '@/integrations/supabase/client';
import { GameState } from '@/context/types';
import { Json } from '@/integrations/supabase/types';
import { getUserIdentifier } from '../userIdentification';
import { checkSupabaseConnection } from '../connectionUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { SAVES_TABLE } from '../apiTypes';

// Сохранение игры в Supabase
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    console.log(`🔄 Сохранение игры для пользователя: ${userId}`);
    
    // Проверяем подключение к Supabase
    const isConnected = await checkSupabaseConnection();
      
    if (!isConnected) {
      safeDispatchGameEvent(
        "Не удалось сохранить прогресс. Проверьте соединение с интернетом.", 
        "error"
      );
      return false;
    }
    
    console.log('🔄 Сохранение в Supabase...');
    
    // Клонируем состояние, чтобы не изменять оригинал
    const gameStateCopy = JSON.parse(JSON.stringify(gameState));
    
    // Убеждаемся, что флаг gameStarted установлен
    gameStateCopy.gameStarted = true;
    
    // Обрабатываем корректно поле activated для рефералов
    if (gameStateCopy.referrals && gameStateCopy.referrals.length > 0) {
      gameStateCopy.referrals = gameStateCopy.referrals.map((referral: any) => {
        if (typeof referral.activated === 'string') {
          return {
            ...referral,
            activated: referral.activated === 'true'
          };
        }
        return referral;
      });
    }
    
    // Преобразуем GameState в Json
    let gameDataJson: Json;
    try {
      const jsonString = JSON.stringify(gameStateCopy);
      gameDataJson = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Ошибка преобразования состояния игры в JSON:', parseError);
      return false;
    }
    
    // Готовим данные для сохранения
    const saveData = {
      user_id: userId,
      game_data: gameDataJson,
      updated_at: new Date().toISOString()
    };
    
    // Обновляем существующую запись
    const { error } = await supabase
      .from(SAVES_TABLE)
      .upsert(saveData, { onConflict: 'user_id' });
    
    if (error) {
      console.error('❌ Ошибка при сохранении в Supabase:', error);
      
      // Пробуем создать таблицу и повторить попытку если таблица не существует
      if (error.code === 'PGRST116') {
        // Импортируем динамически для избежания циклических зависимостей
        const { createSavesTableIfNotExists } = await import('../tableManagement');
        const tableCreated = await createSavesTableIfNotExists();
        
        if (tableCreated) {
          // Повторяем попытку сохранения
          const { error: retryError } = await supabase
            .from(SAVES_TABLE)
            .upsert(saveData, { onConflict: 'user_id' });
            
          if (retryError) {
            console.error('❌ Ошибка при повторном сохранении в Supabase:', retryError);
            return false;
          }
          
          console.log('✅ Игра успешно сохранена после создания таблицы');
          return true;
        }
      }
      
      return false;
    }
    
    console.log('✅ Игра успешно сохранена в Supabase');
    return true;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении игры:', error);
    return false;
  }
};
