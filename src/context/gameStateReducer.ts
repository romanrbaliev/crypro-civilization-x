import { GameState } from './types';
import { initialState } from './initialState';
import { safeDispatchGameEvent } from './utils/eventBusUtils';
import { checkAllUnlocks, checkSpecialUnlocks } from '@/utils/unlockSystem';

// Обработка запуска игры
export const processStartGame = (state: GameState): GameState => {
  // Клонируем initialState для чистого старта
  const baseState = JSON.parse(JSON.stringify(initialState));
  
  // Создаем новое состояние на основе initialState
  const newState: GameState = {
    ...baseState,
    gameStarted: true,
    lastUpdate: Date.now()
  };
  
  // Ресурсы - начальная разблокировка только знаний
  newState.resources = {
    ...baseState.resources,
    knowledge: {
      ...baseState.resources.knowledge,
      unlocked: true
    }
  };

  // Явно блокируем все остальные ресурсы
  if (newState.resources.usdt) {
    newState.resources.usdt.unlocked = false;
  }
  
  if (newState.resources.electricity) {
    newState.resources.electricity.unlocked = false;
  }
  
  if (newState.resources.computingPower) {
    newState.resources.computingPower.unlocked = false;
  }
  
  if (newState.resources.bitcoin) {
    newState.resources.bitcoin.unlocked = false;
  }
  
  // Применяем все разблокировки для начального состояния
  const finalState = checkAllUnlocks(newState);
  
  console.log('processStartGame: Начальное состояние ресурсов:', {
    knowledgeUnlocked: finalState.resources.knowledge.unlocked,
    usdtExists: !!finalState.resources.usdt,
    usdtUnlocked: finalState.resources.usdt?.unlocked || false
  });
  
  return finalState;
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
    
    // Создаем новое состояние на основе initialState и гарантируем наличие usdt
    // Используем явное приведение типа
    const newInitialState: GameState = {
      ...initialState,
      gameStarted: true,
      lastUpdate: Date.now(),
      lastSaved: Date.now(),
      resources: {
        ...initialState.resources,
        usdt: {
          ...initialState.resources.usdt,
          unlocked: false
        }
      },
      unlocks: {
        ...initialState.unlocks,
        usdt: false
      }
    };
    
    return newInitialState;
  }
  
  // Проверяем целостность загруженных данных
  if (!payload.resources || !payload.buildings) {
    console.error('❌ Загруженные данные повреждены, используем начальное состояние');
    safeDispatchGameEvent('Загруженные данные повреждены, начинаем новую игру', 'error');
    
    // Создаем новое состояние на основе initialState и гарантируем наличие usdt
    // Используем явное приведение типа
    const newInitialState: GameState = {
      ...initialState,
      gameStarted: true,
      lastUpdate: Date.now(),
      lastSaved: Date.now(),
      resources: {
        ...initialState.resources,
        usdt: {
          ...initialState.resources.usdt,
          unlocked: false
        }
      },
      unlocks: {
        ...initialState.unlocks,
        usdt: false
      }
    };
    
    return newInitialState;
  }
  
  // Клонируем загруженное состояние
  let loadedState = JSON.parse(JSON.stringify(payload)) as GameState;
  
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
  
  // Проверка и обработка каждого ресурса из initialState
  Object.keys(initialState.resources).forEach(resourceKey => {
    if (!loadedState.resources[resourceKey]) {
      console.warn(`⚠️ Ресурс ${resourceKey} не найден в загруженном состоянии! Добавляем из initialState.`);
      loadedState.resources[resourceKey] = { ...initialState.resources[resourceKey] };
    } else {
      // Важное исправление: убедимся, что ресурсы имеют правильный статус разблокировки
      // USDT должен быть заблокирован, если не выполнены условия
      if (resourceKey === 'usdt') {
        loadedState.resources.usdt.unlocked = false;
        
        if (loadedState.counters && 
            loadedState.counters.applyKnowledge && 
            loadedState.counters.applyKnowledge.value >= 2) {
          // Разблокируем только если условие выполнено
          loadedState.resources.usdt.unlocked = true;
          loadedState.unlocks.usdt = true;
          console.log('✅ USDT разблокирован: счетчик applyKnowledge >=2');
        } else {
          // Иначе явно блокируем
          loadedState.resources.usdt.unlocked = false;
          loadedState.unlocks.usdt = false;
          console.log('🔒 USDT заблокирован: счетчик applyKnowledge < 2');
        }
      }
    }
  });
  
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
    // Обработка данных о рефералах - конвертируем строковые значения в булев тип
    loadedState.referrals = loadedState.referrals.map((referral) => {
      // Преобразуем строковое значение в булевое, если необходимо
      if (typeof referral.activated === 'string') {
        const isActivated = referral.activated === 'true';
        console.log(`Преобразуем строковое значение ${referral.activated} в булевое ${isActivated} для реферала ${referral.id}`);
        return { ...referral, activated: isActivated };
      }
      
      return referral;
    });
    
    console.log('✅ Окончательные статусы рефералов после обработки:', 
      loadedState.referrals.map(r => ({ id: r.id, activated: r.activated, type: typeof r.activated }))
    );
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
  
  // Проверяем и применяем все разблокировки при загрузке игры
  loadedState = checkSpecialUnlocks(loadedState);
  loadedState = checkAllUnlocks(loadedState);
  
  // ВАЖНО: Финальная проверка статуса USDT после всех проверок разблокировок
  if (loadedState.resources.usdt) {
    // Проверяем условие для разблокировки USDT
    if (!loadedState.counters.applyKnowledge || loadedState.counters.applyKnowledge.value < 2) {
      // Если условие не выполнено, принудительно блокируем USDT
      loadedState.resources.usdt.unlocked = false;
      loadedState.unlocks.usdt = false;
      console.log('🔒 Финальная блокировка USDT: условие не выполнено');
    }
  }
  
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
