
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Обработчик покупки улучшения
export const processPurchaseUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  const { upgradeId } = payload;
  
  // Проверяем, существует ли такое улучшение
  if (!state.upgrades[upgradeId]) {
    console.log(`Улучшение с ID ${upgradeId} не найдено`);
    return state;
  }
  
  const upgrade = state.upgrades[upgradeId];
  
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
    [upgradeId]: {
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
  
  // Применяем специальные эффекты для конкретных улучшений
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Применяем специальные эффекты 'Основы блокчейна'");
    
    // 1. Увеличиваем макс. хранение знаний на 50%
    if (newState.resources.knowledge) {
      const baseMax = 100; // Базовое значение
      const newMax = baseMax * 1.5; // Именно +50% от базового значения, а не умножение текущего на 1.5
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newMax
      };
      
      console.log(`Максимум знаний установлен на ${newMax}`);
    }
    
    // 2. Увеличиваем скорость производства знаний на 10%
    // Обновляем эффекты улучшения, чтобы BonusCalculationService правильно их учитывал
    newState.upgrades[upgradeId] = {
      ...newState.upgrades[upgradeId],
      effects: {
        ...(newState.upgrades[upgradeId].effects || {}),
        knowledgeBoost: 0.1,
        knowledgeMaxBoost: 0.5
      }
    };
    
    // 3. Разблокируем криптокошелек
    if (newState.buildings.cryptoWallet) {
      newState.buildings.cryptoWallet = {
        ...newState.buildings.cryptoWallet,
        unlocked: true
      };
      
      // Добавляем флаг разблокировки в unlocks
      newState.unlocks = {
        ...newState.unlocks,
        cryptoWallet: true
      };
      
      console.log("Криптокошелек разблокирован");
    }
    
    // 4. Разблокируем исследование "Основы криптовалют"
    if (newState.upgrades.cryptoCurrencyBasics) {
      newState.upgrades.cryptoCurrencyBasics = {
        ...newState.upgrades.cryptoCurrencyBasics,
        unlocked: true
      };
      console.log("Исследование 'Основы криптовалют' разблокировано");
    }
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы блокчейна: +50% к макс. хранению знаний, +10% к скорости их получения", "success");
  }
  
  if (upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
    console.log("Применяем эффекты 'Основы криптовалют'");
    
    // 1. Добавляем бонус эффективности применения знаний
    newState.upgrades.cryptoCurrencyBasics = {
      ...newState.upgrades.cryptoCurrencyBasics,
      effects: {
        ...(newState.upgrades.cryptoCurrencyBasics.effects || {}),
        knowledgeEfficiencyBoost: 0.1
      }
    };
    
    // 2. Разблокируем майнер (проверяем оба возможных ID)
    if (newState.buildings.miner) {
      newState.buildings.miner = {
        ...newState.buildings.miner,
        unlocked: true
      };
      
      newState.unlocks = {
        ...newState.unlocks,
        miner: true
      };
      
      console.log("Майнер разблокирован");
    }
    
    // Альтернативное название здания - autoMiner
    if (newState.buildings.autoMiner) {
      newState.buildings.autoMiner = {
        ...newState.buildings.autoMiner,
        unlocked: true
      };
      
      newState.unlocks = {
        ...newState.unlocks,
        autoMiner: true
      };
      
      console.log("Автомайнер разблокирован");
    }
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы криптовалют: +10% к эффективности применения знаний", "info");
  }
  
  if (upgradeId === 'cryptoWalletSecurity' || upgradeId === 'walletSecurity') {
    console.log("Применяем эффекты 'Безопасность криптокошельков'");
    
    // Увеличиваем макс. хранение USDT на 25%
    if (newState.resources.usdt) {
      const currentMax = newState.resources.usdt.max || 50;
      const newMax = currentMax * 1.25;
      
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: newMax
      };
      
      console.log(`Максимум USDT увеличен с ${currentMax} до ${newMax}`);
    }
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Безопасность кошельков: +25% к макс. хранению USDT", "info");
  }
  
  // Логируем покупку
  console.log(`Куплено улучшение: ${upgrade.name}`);
  
  return newState;
};
