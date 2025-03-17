
import { GameState } from '../types';
import { initialState } from '../initialState';
import { isTelegramCloudStorageAvailable } from '@/utils/helpers';
import { saveGameToServer, loadGameFromServer } from '@/api/gameDataService';

// Константа с именем ключа локального хранилища
export const GAME_STORAGE_KEY = 'cryptoCivilizationSave';

// Проверка доступности localStorage
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage недоступен, будет использовано временное хранилище:', e);
    return false;
  }
};

// Глобальное постоянное хранилище для сред, где localStorage недоступен
let memoryStorage: Record<string, string> = {};

// Сохранение состояния игры
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    // Обновляем timestamp перед сохранением
    const stateToSave = {
      ...state,
      lastSaved: Date.now()
    };
    
    console.log(`🔄 Сохранение игры (размер данных: ~${JSON.stringify(stateToSave).length} байт)`);
    
    // Сначала пытаемся сохранить на сервере (наш основной метод)
    const serverSaved = await saveGameToServer(stateToSave);
    
    // Если удалось сохранить на сервере, то дополнительно не сохраняем локально
    if (serverSaved) {
      console.log('✅ Игра успешно сохранена на сервере:', new Date().toLocaleTimeString());
      return true;
    }
    
    // Если не удалось сохранить на сервере, используем запасные варианты
    console.warn('⚠️ Не удалось сохранить на сервере, используем локальное хранилище');
    
    const serializedState = JSON.stringify(stateToSave);
    
    // Сохраняем в localStorage, если доступен
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(GAME_STORAGE_KEY, serializedState);
        console.log('✅ Данные сохранены в localStorage');
        return true;
      } catch (localStorageError) {
        console.error('❌ Ошибка при сохранении в localStorage:', localStorageError);
      }
    }

    // Если ничего не работает, используем память
    memoryStorage[GAME_STORAGE_KEY] = serializedState;
    console.log('✅ Данные сохранены в памяти (временное хранилище)');
    return true;
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    
    // В крайнем случае сохраняем в память
    try {
      memoryStorage[GAME_STORAGE_KEY] = JSON.stringify({
        ...state,
        lastSaved: Date.now()
      });
      console.log('✅ Данные сохранены в памяти (аварийное сохранение)');
      return true;
    } catch (e) {
      console.error('❌ Не удалось сохранить даже в память:', e);
      return false;
    }
  }
}

// Рекурсивное объединение объектов для корректного сохранения вложенных структур
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (key in target && typeof target[key] === 'object' && target[key] !== null) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          output[key] = { ...source[key] };
        }
      } else {
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

// Загрузка состояния игры
export async function loadGameState(): Promise<GameState | null> {
  try {
    console.log('🔄 Начинаем загрузку сохраненной игры...');
    
    // Сначала пытаемся загрузить с сервера (наш основной метод)
    const serverState = await loadGameFromServer();
    
    if (serverState) {
      console.log(`✅ Игра успешно загружена с сервера (lastSaved: ${new Date(serverState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
      
      // Используем глубокое объединение для правильного слияния всех вложенных объектов
      const mergedState = deepMerge(initialState, serverState);
      
      // Обновляем timestamp последнего обновления
      mergedState.lastUpdate = Date.now();
      
      return mergedState;
    }
    
    console.log('ℹ️ Сохранение на сервере не найдено, проверяем локальные хранилища');
    
    // Если не удалось загрузить с сервера, пробуем localStorage
    if (isLocalStorageAvailable()) {
      const serializedState = localStorage.getItem(GAME_STORAGE_KEY);
      
      if (serializedState) {
        try {
          const loadedState = JSON.parse(serializedState) as GameState;
          console.log(`✅ Загружено состояние игры из localStorage (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
          
          // Используем глубокое объединение для правильного слияния всех вложенных объектов
          const mergedState = deepMerge(initialState, loadedState);
          
          // Обновляем timestamp последнего обновления
          mergedState.lastUpdate = Date.now();
          
          return mergedState;
        } catch (parseError) {
          console.error('❌ Ошибка при разборе JSON данных из localStorage:', parseError);
        }
      }
    }
    
    // Пробуем из памяти, если всё остальное не сработало
    if (memoryStorage[GAME_STORAGE_KEY]) {
      try {
        const loadedState = JSON.parse(memoryStorage[GAME_STORAGE_KEY]) as GameState;
        console.log(`✅ Загружено состояние игры из памяти (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
        
        // Используем глубокое объединение для правильного слияния всех вложенных объектов
        const mergedState = deepMerge(initialState, loadedState);
        
        // Обновляем timestamp последнего обновления
        mergedState.lastUpdate = Date.now();
        
        return mergedState;
      } catch (parseError) {
        console.error('❌ Ошибка при разборе JSON данных из памяти:', parseError);
      }
    }
    
    console.log('❌ Сохранение не найдено ни в одном хранилище, начинаем новую игру');
    return null;
  } catch (error) {
    console.error('❌ Критическая ошибка при загрузке состояния игры:', error);
    return null;
  }
}

// Удаление сохраненного состояния игры
export async function clearGameState(): Promise<void> {
  try {
    console.log('🔄 Удаление всех сохранений игры...');
    
    // Попытка удалить сохранение с сервера
    // Примечание: для этого нужно реализовать API метод удаления
    
    // Удаляем из localStorage, если доступен
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      console.log('✅ Сохранение удалено из localStorage');
    }
    
    // Удаляем из памяти
    delete memoryStorage[GAME_STORAGE_KEY];
    console.log('✅ Сохранение удалено из памяти');
    
    console.log('✅ Все сохранения игры успешно удалены');
  } catch (error) {
    console.error('❌ Не удалось удалить сохранение игры:', error);
  }
}
