
import { GameState } from '@/context/types';
import { initialState } from '@/context/initialState';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { supabase } from '@/integrations/supabase/client';
import { getUserIdentifier } from '@/api/userIdentification';
import { mergeWithInitialState, validateGameState } from '@/api/gameStorage/stateUtils';
import { SAVES_TABLE } from '@/api/apiTypes';

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
    const userId = await getUserIdentifier();
    
    const { data, error } = await supabase
      .from(SAVES_TABLE)
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
    
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке игры:', error);
    safeDispatchGameEvent('Ошибка загрузки игры', 'error');
    return null;
  }
}
