
import { GameState, Upgrade } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

export const processPurchaseUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  if (!upgrade) {
    console.error(`Upgrade with id ${upgradeId} not found`);
    return state;
  }
  
  // Если апгрейд уже куплен, ничего не делаем
  if (upgrade.purchased) {
    console.log(`Upgrade ${upgrade.name} is already purchased`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      console.log(`Not enough ${resourceId} to purchase ${upgrade.name}`);
      return state;
    }
  }
  
  // Создаем копию состояния для модификации
  const newState = { ...state };
  
  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    newState.resources[resourceId] = {
      ...newState.resources[resourceId],
      value: newState.resources[resourceId].value - Number(amount)
    };
  }
  
  // Отмечаем апгрейд как купленный
  newState.upgrades[upgradeId] = {
    ...upgrade,
    purchased: true
  };
  
  // Применяем эффекты от апгрейда
  if (upgradeId === 'blockchainBasics') {
    // Увеличиваем максимальное количество знаний на 50% и скорость их получения на 10%
    const knowledgeResource = newState.resources.knowledge;
    const maxBoost = knowledgeResource.max * 0.5;
    
    newState.resources.knowledge = {
      ...knowledgeResource,
      max: knowledgeResource.max + maxBoost
    };
    
    // Разблокировка исследований
    if (!newState.unlocks.research) {
      newState.unlocks.research = true;
      safeDispatchGameEvent('Разблокирована возможность: Исследования', 'info');
    }
    
  } else if (upgradeId === 'walletSecurity') {
    // Увеличиваем максимальное количество USDT на 25%
    const usdtResource = newState.resources.usdt;
    const maxBoost = usdtResource.max * 0.25;
    
    newState.resources.usdt = {
      ...usdtResource,
      max: usdtResource.max + maxBoost
    };
    
  } else if (upgradeId === 'algorithmOptimization') {
    // Увеличиваем эффективность майнинга на 15%
    const miningEfficiency = newState.miningParams.miningEfficiency;
    
    newState.miningParams = {
      ...state.miningParams,
      miningEfficiency: miningEfficiency * 1.15,
      volatility: (state.miningParams?.volatility || 0.05)
    };
    
  } else if (upgradeId === 'proofOfWork') {
    // Увеличиваем эффективность майнинга на 25%
    const miningEfficiency = newState.miningParams.miningEfficiency;
    
    newState.miningParams = {
      ...state.miningParams,
      miningEfficiency: miningEfficiency * 1.25,
      volatility: (state.miningParams?.volatility || 0.05)
    };
    
  } else if (upgradeId === 'energyEfficientComponents') {
    // Уменьшаем потребление электричества всеми устройствами на 10%
    const energyEfficiency = newState.miningParams.energyEfficiency;
    
    newState.miningParams = {
      ...state.miningParams,
      energyEfficiency: energyEfficiency * 1.1,
      volatility: (state.miningParams?.volatility || 0.05)
    };
    
  } else if (upgradeId === 'cryptoTrading') {
    // Разблокируем возможность трейдинга
    newState.unlocks.trading = true;
    safeDispatchGameEvent('Разблокирована возможность: Трейдинг', 'info');
    
  } else if (upgradeId === 'tradingBot') {
    // Разблокируем автоматический трейдинг
    newState.unlocks.autoSell = true;
    safeDispatchGameEvent('Разблокирована возможность: Автоматический трейдинг', 'info');
  }
  
  safeDispatchGameEvent(`Изучено: ${upgrade.name}`, 'info');
  
  return newState;
};
