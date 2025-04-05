
import { GameState } from '@/context/types';
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from './userIdentification';
import { Json } from '@/integrations/supabase/types';

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
    
    // Конвертируем GameState в JSON-объект для Supabase
    const gameDataAsJson = JSON.parse(JSON.stringify(gameState)) as Json;
    
    // Сохраняем состояние игры в таблицу game_saves
    const { error } = await supabase
      .from('game_saves')
      .upsert({
        user_id: userId,
        game_data: gameDataAsJson,
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
    
    // Преобразуем данные из JSON в GameState
    const gameState = data.game_data as unknown as GameState;
    return gameState;
  } catch (error) {
    console.error('❌ Ошибка при загрузке игры:', error);
    return null;
  }
};

// Функция загрузки состояния игры (необходимая для useGameLoader)
export const loadGameState = loadGameFromServer;

// Функции очистки сохраненных данных
export const clearAllSavedData = async (): Promise<boolean> => {
  try {
    const userId = await getUserIdentifier();
    
    if (!userId) {
      console.error('❌ Не удалось получить ID пользователя для очистки данных');
      return false;
    }
    
    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      console.error('❌ Ошибка при очистке сохранения:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при очистке сохранения:', error);
    return false;
  }
};

// Функция полной очистки для администраторов
export const clearAllSavedDataForAllUsers = async (): Promise<boolean> => {
  try {
    // Это опасная операция, поэтому добавим дополнительные проверки
    const isAdmin = await checkAdminPermission();
    
    if (!isAdmin) {
      console.error('❌ Отказано в доступе: Требуются права администратора');
      return false;
    }
    
    const { error } = await supabase
      .from('game_saves')
      .delete()
      .neq('user_id', 'system'); // Исключаем системные данные
      
    if (error) {
      console.error('❌ Ошибка при очистке всех сохранений:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при очистке всех сохранений:', error);
    return false;
  }
};

// Вспомогательная функция для проверки прав администратора
async function checkAdminPermission(): Promise<boolean> {
  // В реальном приложении здесь будет проверка прав администратора
  // Для примера всегда возвращаем false, чтобы предотвратить случайную очистку
  return false;
}
