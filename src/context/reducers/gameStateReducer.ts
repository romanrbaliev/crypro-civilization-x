
import { GameState } from '../types';
import { initialState } from '../initialState';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработка запуска игры
export const processStartGame = (state: GameState): GameState => {
  return {
    ...state,
    gameStarted: true,
    lastUpdate: Date.now()
  };
};

// Обработка загрузки сохраненной игры
export const processLoadGame = (
  state: GameState,
  payload: GameState | null
): GameState => {
  console.log('🔄 Загружаем сохраненное состояние игры:', payload ? 'данные найдены' : 'данные отсутствуют');
  
  // Проверяем наличие данных для загрузки
  if (!payload) {
    console.warn('⚠️ Нет данных для загрузки, используем начальное состояние');
    safeDispatchGameEvent('Нет данных для загрузки, начинаем новую игру', 'warning');
    return {
      ...initialState,
      gameStarted: true,
      lastUpdate: Date.now(),
      lastSaved: Date.now()
    };
  }
  
  // Проверяем целостность загруженных данных
  if (!payload.resources || !payload.buildings) {
    console.error('❌ Загруженные данные повреждены, используем начальное состояние');
    safeDispatchGameEvent('Загруженные данные повреждены, начинаем новую игру', 'error');
    return {
      ...initialState,
      gameStarted: true,
      lastUpdate: Date.now(),
      lastSaved: Date.now()
    };
  }
  
  // Проверяем и исправляем несогласованности в загруженных данных
  const loadedState = { ...payload };
  
  // КРИТИЧЕСКИЙ ФИХ: синхронизация разблокировки практики
  if (loadedState.unlocks && loadedState.unlocks.practice) {
    console.log('Обнаружена разблокированная функция practice, проверяем здание...');
    
    if (loadedState.buildings && loadedState.buildings.practice) {
      // Обязательно разблокируем здание practice если функция разблокирована
      loadedState.buildings.practice = {
        ...loadedState.buildings.practice,
        unlocked: true
      };
      console.log('✅ Синхронизировали разблокировку здания практики с функцией практики');
    } else {
      console.warn('⚠️ Здание practice не найдено в загруженном состоянии!');
    }
  }
  
  // Проверка и добавление новых полей, которых могло не быть в сохранении
  if (!loadedState.specializationSynergies) {
    loadedState.specializationSynergies = { ...initialState.specializationSynergies };
    console.log('✅ Добавлены отсутствующие данные о синергиях специализаций в редьюсере');
  }
  
  // Обновляем timestamp для правильной работы логики обновления
  loadedState.lastUpdate = Date.now();
  
  console.log('✅ Загруженное состояние применено успешно');
  safeDispatchGameEvent('Прогресс успешно восстановлен', 'success');
  
  return loadedState;
};

// Обработка престижа (перезапуск с бонусами)
export const processPrestige = (state: GameState): GameState => {
  // Рассчитываем очки престижа
  const prestigePoints = Math.floor(
    Math.log(state.resources.usdt.value / 1000) * 10
  );
  
  return {
    ...initialState,
    prestigePoints: state.prestigePoints + Math.max(0, prestigePoints),
    gameStarted: true,
    lastUpdate: Date.now()
  };
};

// Обработка полного сброса прогресса
export const processResetGame = (state: GameState): GameState => {
  return {
    ...initialState,
    gameStarted: true,
    lastUpdate: Date.now()
  };
};

// Обработка перезапуска компьютеров
export const processRestartComputers = (state: GameState): GameState => {
  // Перезапускаем компьютеры после нехватки электричества
  return {
    ...state,
    eventMessages: {
      ...state.eventMessages,
      electricityShortage: false
    }
  };
};
