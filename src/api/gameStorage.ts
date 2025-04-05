
import { GameState } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';

/**
 * Сохраняет состояние игры на сервере
 * @param gameState Состояние игры
 * @returns true если сохранение успешно
 */
export const saveGameToServer = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для сохранения');
      return false;
    }
    
    // Сохраняем состояние игры в таблицу game_saves
    const { error } = await supabase
      .from('game_saves')
      .upsert({
        user_id: userId,
        game_data: gameState,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('❌ Ошибка при сохранении игры:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при сохранении игры:', error);
    return false;
  }
};

/**
 * Загружает состояние игры с сервера
 * @returns Состояние игры или null если нет сохранения
 */
export const loadGameFromServer = async (): Promise<GameState | null> => {
  try {
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для загрузки');
      return null;
    }
    
    // Загружаем состояние игры из таблицы game_saves
    const { data, error } = await supabase
      .from('game_saves')
      .select('game_data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Ошибка при загрузке игры:', error);
      return null;
    }
    
    if (!data) {
      console.log('ℹ️ Сохранения игры не найдены');
      return null;
    }
    
    return data.game_data as GameState;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры:', error);
    return null;
  }
};
