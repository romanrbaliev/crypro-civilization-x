import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { updateResourceMaxValues } from '../utils/resourceUtils';

// Обработчик покупки улучшения
export const processPurchaseUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  const { upgradeId } = payload;
  
  // ИСПРАВЛЕНИЕ: Обработка разных вариантов ID для "Основы блокчейна"
  let actualUpgradeId = upgradeId;
  
  // Если это одна из вариаций ID для "Основы блокчейна", используем канонический ID
  const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
  if (blockchainBasicsIds.includes(upgradeId) && upgradeId !== 'blockchainBasics') {
    if (state.upgrades.blockchainBasics) {
      console.log(`Используем канонический ID 'blockchainBasics' вместо '${upgradeId}'`);
      actualUpgradeId = 'blockchainBasics';
    }
  }
  
  // Проверяем, существует ли такое улучшение
  if (!state.upgrades[actualUpgradeId]) {
    console.log(`Улучшение с ID ${actualUpgradeId} не найдено`);
    return state;
  }
  
  const upgrade = state.upgrades[actualUpgradeId];
  
  // Проверяем, разблокировано ли улучшение
  if (!upgrade.unlocked) {
    console.log(`Улучшение ${upgrade.name} еще не разблокировано`);
    return state;
  }
  
  // Проверяем, уже куплено ли улучшение
  if (upgrade.purchased) {
    console.log(`Улучшение ${upgrade.name} уже приобретено`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const cost = upgrade.cost;
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < amount) {
      console.log(`Недостаточно ресурса ${resourceId} для покупки ${upgrade.name}`);
      return state;
    }
  }
  
  // Создаем копии для изменения
  const updatedResources = { ...state.resources };
  
  // Вычитаем стоимость
  for (const [resourceId, amount] of Object.entries(cost)) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(amount)
    };
  }
  
  // Обновляем улучшение
  const updatedUpgrades = {
    ...state.upgrades,
    [actualUpgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  // Создаем новое состояние с обновлениями
  let newState = {
    ...state,
    resources: updatedResources,
    upgrades: updatedUpgrades
  };
  
  console.log(`Покупка улучшения: ${upgrade.name} [ID: ${actualUpgradeId}]`);
  
  // Применяем специальные эффекты для конкретных улучшений
  if (actualUpgradeId === 'blockchainBasics' || actualUpgradeId === 'basicBlockchain' || actualUpgradeId === 'blockchain_basics') {
    console.log("Применяем специальные эффекты 'Основы блокчейна'");
    
    // 1. Увеличиваем макс. хранение знаний на 50%
    if (newState.resources.knowledge) {
      const baseMax = newState.resources.knowledge.max || 100; // Базовое значение
      const newMax = baseMax * 1.5; // +50% от текущего значения
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newMax
      };
      
      console.log(`Максимум знаний установлен на ${newMax}`);
    }
    
    // 2. ИСПРАВЛЕНИЕ: Не изменяем perSecond и production здесь, 
    // иначе будет двойное применение с ResourceProductionService
    // Просто устанавливаем эффекты улучшения для корректного применения в других местах
    
    // Обновляем эффекты улучшения, чтобы BonusCalculationService правильно их учитывал
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        knowledgeBoost: 0.1, // Установлено 10%
        knowledgeMaxBoost: 0.5
      }
    };
    
    // 3. Разблокируем исследование "Основы криптовалют" вместо криптокошелька
    if (newState.upgrades.cryptoCurrencyBasics || newState.upgrades.cryptoBasics) {
      const cryptoBasicsId = newState.upgrades.cryptoCurrencyBasics ? 'cryptoCurrencyBasics' : 'cryptoBasics';
      
      newState.upgrades[cryptoBasicsId] = {
        ...newState.upgrades[cryptoBasicsId],
        unlocked: true
      };
      console.log("Исследование 'Основы криптовалют' разблокировано после 'Основы блокчейна'");
    }
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы блокчейна: +50% к макс. хранению знаний, +10% к скорости их получения", "success");
  }
  
  if (actualUpgradeId === 'cryptoCurrencyBasics' || actualUpgradeId === 'cryptoBasics') {
    console.log("Применяем эффекты 'Основы криптовалют'");
    
    // 1. Добавляем бонус эффективности применения знаний
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        knowledgeEfficiencyBoost: 0.1
      }
    };
    
    // 2. Разблокируем майнер (проверяем оба возможных ID и принудительно разблокируем)
    console.log("Принудительно разблокируем майнер после изучения 'Основы криптовалют'");
    
    // Разблокируем майнер по всем возможным ID
    // Первый вариант - 'miner'
    if (newState.buildings.miner) {
      newState.buildings.miner = {
        ...newState.buildings.miner,
        unlocked: true
      };
      
      newState.unlocks = {
        ...newState.unlocks,
        miner: true
      };
      
      console.log("Майнер (ID: miner) принудительно разблокирован");
    }
    
    // Второй вариант - 'autoMiner'
    if (newState.buildings.autoMiner) {
      newState.buildings.autoMiner = {
        ...newState.buildings.autoMiner,
        unlocked: true
      };
      
      newState.unlocks = {
        ...newState.unlocks,
        autoMiner: true
      };
      
      console.log("Автомайнер (ID: autoMiner) принудительно разблокирован");
    }
    
    // Не разблокируем Bitcoin до покупки майнера
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы криптовалют: +10% к эффективности применения знаний, разблокирован майнер", "info");
  }
  
  if (actualUpgradeId === 'cryptoWalletSecurity' || actualUpgradeId === 'walletSecurity') {
    console.log("Применяем эффекты 'Безопасность криптокошельков'");
    
    // Увеличиваем макс. хранение USDT на 25%
    if (newState.resources.usdt) {
      const currentMax = newState.resources.usdt.max || 50;
      const newMax = Math.round(currentMax * 1.25); // Округляем результат
      
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: newMax
      };
      
      console.log(`Максимум USDT увеличен с ${currentMax} до ${newMax}`);
    }
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        usdtMaxBoost: 0.25
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Безопасность кошельков: +25% к макс. хранению USDT", "info");
  }
  
  if (actualUpgradeId === 'algorithmOptimization') {
    console.log("Применяем эффекты 'Оптимизация алгоритмов'");
    
    // Увеличиваем эффективность майнинга на 15%
    if (newState.miningParams) {
      newState.miningParams = {
        ...newState.miningParams,
        miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.15
      };
    } else {
      // Если параметры майнинга не были инициализированы
      // Создаем объект с полным набором необходимых полей
      newState.miningParams = {
        miningEfficiency: 1.15,
        energyEfficiency: 0,
        networkDifficulty: 1,
        exchangeRate: 20000,
        exchangeCommission: 0.01,
        volatility: 0.05,
        exchangePeriod: 3600,
        baseConsumption: 1
      };
    }
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        miningEfficiencyBoost: 0.15
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Оптимизация алгоритмов: +15% к эффективности майнинга", "info");
  }
  
  if (actualUpgradeId === 'proofOfWork') {
    console.log("Применяем эффекты 'Proof of Work'");
    
    // Увеличиваем эффективность майнинга на 25%
    if (newState.miningParams) {
      newState.miningParams = {
        ...newState.miningParams,
        miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.25
      };
    } else {
      // Если параметры майнинга не были инициализированы
      // Создаем объект с полным набором необходимых полей
      newState.miningParams = {
        miningEfficiency: 1.25,
        energyEfficiency: 0,
        networkDifficulty: 1,
        exchangeRate: 20000,
        exchangeCommission: 0.01,
        volatility: 0.05,
        exchangePeriod: 3600,
        baseConsumption: 1
      };
    }
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        miningEfficiencyBoost: 0.25
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Proof of Work: +25% к эффективности майнинга", "info");
  }
  
  if (actualUpgradeId === 'energyEfficientComponents') {
    console.log("Применяем эффекты 'Энергоэффективные компоненты'");
    
    // Снижаем потребление электричества на 10%
    if (newState.miningParams) {
      newState.miningParams = {
        ...newState.miningParams,
        energyEfficiency: (newState.miningParams.energyEfficiency || 0) + 0.1
      };
    } else {
      // Если параметры майнинга не были инициализированы
      // Создаем объект с полным набором необходимых полей
      newState.miningParams = {
        miningEfficiency: 1,
        energyEfficiency: 0.1,
        networkDifficulty: 1,
        exchangeRate: 20000,
        exchangeCommission: 0.01,
        volatility: 0.05,
        exchangePeriod: 3600,
        baseConsumption: 1
      };
    }
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        electricityConsumptionReduction: 0.1
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Энергоэффективные компоненты: -10% к потреблению электричества", "info");
  }
  
  if (actualUpgradeId === 'cryptoTrading') {
    console.log("Применяем эффекты 'Криптовалютный трейдинг'");
    
    // Разблокируем трейдинг
    newState.unlocks = {
      ...newState.unlocks,
      trading: true
    };
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        unlockTrading: true
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Криптовалютный трейдинг: разблокирована возможность обмена криптовалютами", "info");
  }
  
  if (actualUpgradeId === 'tradingBot') {
    console.log("Применяем эффекты 'Торговый бот'");
    
    // Разблокируем автоматический трейдинг
    newState.unlocks = {
      ...newState.unlocks,
      autoTrading: true
    };
    
    // Добавляем эффекты, если их нет
    newState.upgrades[actualUpgradeId] = {
      ...newState.upgrades[actualUpgradeId],
      effects: {
        ...(newState.upgrades[actualUpgradeId].effects || {}),
        autoBtcExchange: true
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Торговый бот: разблокирован автоматический обмен BTC", "info");
  }
  
  // ИСПРАВЛЕНИЕ: Принудительно обновляем все вариации ID для "Основы блокчейна"
  for (const id of blockchainBasicsIds) {
    if (newState.upgrades[id] && id !== actualUpgradeId) {
      newState.upgrades[id] = {
        ...newState.upgrades[id],
        purchased: true 
      };
      console.log(`Помечаем ${id} как приобретенное для синхронизации`);
    }
  }
  
  // Обновляем максимальные значения ресурсов после всех изменений
  newState = updateResourceMaxValues(newState);
  
  // Логируем покупку
  console.log(`Куплено улучшение: ${upgrade.name}`);
  
  return newState;
};
