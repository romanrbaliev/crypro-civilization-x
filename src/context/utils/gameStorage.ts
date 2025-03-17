
import { GameState } from '../types';
import { initialState } from '../initialState';
import { saveGameToServer, loadGameFromServer } from '@/api/gameDataService';

// Константа с именем ключа локального хранилища (для совместимости со старыми версиями)
export const GAME_STORAGE_KEY = 'cryptoCivilizationSave';

// Глубокое слияние объектов для корректного обновления
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (!source || typeof source !== 'object') {
    return output;
  }
  
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

// Флаг для отслеживания последнего сохранения (предотвращение частых сохранений)
let lastSaveTime = 0;
const SAVE_THROTTLE = 3000; // 3 секунды
let saveInProgress = false;

// Сохранение состояния игры
export async function saveGameState(state: GameState): Promise<boolean> {
  try {
    // Предотвращаем параллельные сохранения
    if (saveInProgress) {
      console.log('⏳ Сохранение уже выполняется, пропускаем...');
      return true;
    }
    
    // Проверка дросселирования сохранений
    const now = Date.now();
    if (now - lastSaveTime < SAVE_THROTTLE) {
      console.log(`⏱️ Сохранение пропущено (прошло ${now - lastSaveTime}мс из ${SAVE_THROTTLE}мс)`);
      return true;
    }
    
    // Устанавливаем флаг сохранения
    saveInProgress = true;
    
    // Обновляем timestamp последнего сохранения
    lastSaveTime = now;
    
    // Обновляем timestamp перед сохранением
    const stateToSave = {
      ...state,
      lastSaved: now
    };
    
    console.log(`🔄 Сохранение игры (размер данных: ~${JSON.stringify(stateToSave).length} байт)`);
    
    try {
      // Сначала сохраняем в localStorage для резервного копирования
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log('✅ Резервная копия сохранена в localStorage');
    } catch (localError) {
      console.warn('⚠️ Не удалось сохранить резервную копию в localStorage:', localError);
    }
    
    // Сохраняем через gameDataService (работает с Supabase или локально)
    const saved = await saveGameToServer(stateToSave);
    
    if (saved) {
      console.log('✅ Игра успешно сохранена');
    } else {
      console.warn('⚠️ Возникли проблемы при сохранении игры');
    }
    
    // Освобождаем флаг сохранения
    saveInProgress = false;
    return saved;
  } catch (error) {
    console.error('❌ Критическая ошибка при сохранении состояния игры:', error);
    
    // Освобождаем флаг сохранения даже при ошибке
    saveInProgress = false;
    
    // При ошибке пытаемся сохранить в localStorage
    try {
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({
        ...state,
        lastSaved: Date.now()
      }));
      console.log('✅ Аварийная копия сохранена в localStorage');
      return true;
    } catch (localError) {
      console.error('❌ Полная ошибка сохранения:', localError);
      return false;
    }
  }
}

// Загрузка состояния игры с поддержкой восстановления из различных источников
export async function loadGameState(): Promise<GameState | null> {
  try {
    console.log('🔄 Начинаем загрузку сохраненной игры...');
    
    // Загружаем через gameDataService (работает с Supabase или локально)
    let loadedState = await loadGameFromServer();
    let stateSource = 'server';
    
    if (!loadedState) {
      console.log('⚠️ Не удалось загрузить из сервиса, пробуем localStorage напрямую...');
      
      // Проверяем localStorage для резервного копирования
      try {
        const localData = localStorage.getItem(GAME_STORAGE_KEY);
        if (localData) {
          loadedState = JSON.parse(localData);
          stateSource = 'localStorage';
          console.log('✅ Игра загружена из localStorage');
        }
      } catch (localError) {
        console.error('❌ Ошибка при загрузке из localStorage:', localError);
      }
    }
    
    if (loadedState) {
      console.log(`✅ Игра успешно загружена из ${stateSource} (lastSaved: ${new Date(loadedState.lastSaved || 0).toLocaleTimeString() || 'не задано'})`);
      
      // Проверяем целостность загруженных данных
      if (!loadedState.resources || !loadedState.buildings || !loadedState.upgrades) {
        console.warn('⚠️ Загруженные данные повреждены, выполняем восстановление...');
        
        // Восстанавливаем недостающие данные из initialState
        loadedState = {
          ...initialState,
          ...loadedState,
          resources: { ...initialState.resources, ...(loadedState.resources || {}) },
          buildings: { ...initialState.buildings, ...(loadedState.buildings || {}) },
          upgrades: { ...initialState.upgrades, ...(loadedState.upgrades || {}) },
          unlocks: { ...initialState.unlocks, ...(loadedState.unlocks || {}) }
        };
      }
      
      // Используем глубокое объединение для правильного слияния всех вложенных объектов
      const mergedState = deepMerge(initialState, loadedState);
      
      // Обновляем timestamp последнего обновления
      mergedState.lastUpdate = Date.now();
      
      return mergedState;
    }
    
    console.log('❌ Не удалось загрузить сохранение игры');
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
    
    // Удаляем из localStorage
    localStorage.removeItem(GAME_STORAGE_KEY);
    console.log('✅ Локальное сохранение удалено');
    
    // Очищаем через gameDataService
    try {
      await import('@/api/gameDataService').then(module => {
        if (typeof module.clearAllSavedData === 'function') {
          module.clearAllSavedData();
        }
      });
      console.log('✅ Серверное сохранение запрошено на удаление');
    } catch (serviceError) {
      console.error('❌ Ошибка при обращении к сервису данных:', serviceError);
    }
    
    console.log('✅ Все сохранения игры успешно удалены');
  } catch (error) {
    console.error('❌ Не удалось удалить сохранение игры:', error);
  }
}
