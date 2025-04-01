
import { GameState } from '@/context/types';
import { initialState } from '@/context/initialState';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '@/api/userIdentification';

/**
 * Загружает данные игры из localStorage или с сервера
 * @returns {Promise<GameState | null>} Загруженные данные или null в случае ошибки
 */
export async function loadGame(): Promise<GameState | null> {
  try {
    // Сначала пробуем загрузить из localStorage
    const localSave = localStorage.getItem('crypto-civilization-save');
    
    if (localSave) {
      try {
        const parsedData = JSON.parse(localSave) as GameState;
        if (validateGameState(parsedData)) {
          console.log('✅ Загружены данные из localStorage');
          return mergeWithInitialState(parsedData);
        }
      } catch (e) {
        console.error('❌ Ошибка при парсинге данных из localStorage:', e);
      }
    }
    
    // Если локальное сохранение недоступно или повреждено, пробуем загрузить с сервера
    try {
      const userId = await getUserIdentifier();
      
      if (!userId) {
        console.warn('⚠️ Не удалось получить ID пользователя, начинаем новую игру');
        return null;
      }

      const { data, error } = await supabase
        .from('game_saves')
        .select('game_data')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 - запись не найдена
          console.error('❌ Ошибка при загрузке данных с сервера:', error);
        }
        return null;
      }
      
      if (data && data.game_data) {
        console.log('✅ Загружены данные с сервера');
        const gameData = data.game_data as GameState;
        return mergeWithInitialState(gameData);
      }
    } catch (serverError) {
      console.error('❌ Ошибка при загрузке данных с сервера:', serverError);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке игры:', error);
    safeDispatchGameEvent('Ошибка загрузки игры', 'error');
    return null;
  }
}

/**
 * Проверяет целостность состояния игры
 * @param state Состояние игры для проверки
 * @returns true если состояние валидное
 */
function validateGameState(state: any): state is GameState {
  return (
    state &&
    typeof state === 'object' &&
    'resources' in state &&
    'buildings' in state
  );
}

/**
 * Объединяет загруженное состояние с начальным состоянием
 * @param loadedState Загруженное состояние
 * @returns Объединенное состояние
 */
function mergeWithInitialState(loadedState: GameState): GameState {
  return {
    ...initialState,
    ...loadedState,
    // Убедимся, что актуальные метки времени установлены
    lastUpdate: Date.now(),
    lastSaved: Date.now(),
    // Гарантируем, что gameStarted установлен
    gameStarted: true
  };
}
