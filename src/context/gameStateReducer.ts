
import { GameState } from './types';
import { initialState } from './initialState';
import { safeDispatchGameEvent } from './utils/eventBusUtils';

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
  let loadedState = { ...payload };
  
  // Убеждаемся, что игра отмечена как запущенная
  loadedState.gameStarted = true;
  
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
  
  // ВАЖНО: Проверяем наличие cryptoWallet в зданиях
  if (loadedState.buildings && !loadedState.buildings.cryptoWallet && initialState.buildings.cryptoWallet) {
    console.warn('⚠️ Здание cryptoWallet не найдено в загруженном состоянии! Добавляем из initialState.');
    loadedState.buildings.cryptoWallet = { ...initialState.buildings.cryptoWallet };
  }
  
  // Проверка и добавление новых полей, которые могли отсутствовать в сохранении
  if (!loadedState.specializationSynergies) {
    loadedState.specializationSynergies = { ...initialState.specializationSynergies };
    console.log('✅ Добавлены отсутствующие данные о синергиях специализаций в редьюсере');
  }
  
  // Проверка и инициализация реферальных систем
  if (!loadedState.referrals) {
    loadedState.referrals = [];
    console.log('✅ Инициализирован пустой массив рефералов');
  } else {
    // Убеждаемся, что у всех рефералов есть поле activated
    loadedState.referrals = loadedState.referrals.map((referral) => {
      if (typeof referral.activated !== 'boolean') {
        console.log(`Добавляем отсутствующее поле activated для реферала ${referral.id}`);
        return { ...referral, activated: false };
      }
      return referral;
    });
    console.log('✅ Проверены и скорректированы данные рефералов');
  }
  
  if (!loadedState.referralHelpers) {
    loadedState.referralHelpers = [];
    console.log('✅ Инициализирован пустой массив помощников');
  }
  
  // Проверка наличия счетчиков
  if (!loadedState.counters) {
    loadedState.counters = { ...initialState.counters };
    console.log('✅ Добавлены отсутствующие счетчики');
  }
  
  // Проверка наличия событий
  if (!loadedState.eventMessages) {
    loadedState.eventMessages = { ...initialState.eventMessages };
    console.log('✅ Добавлены отсутствующие сообщения о событиях');
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
