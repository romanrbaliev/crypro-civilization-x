
import { GameState, Upgrade } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions } from '@/utils/researchUtils';
import { checkUpgradeUnlocks } from '@/utils/unlockSystem';

// Обработка покупки улучшений
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Если улучшение не существует или уже куплено, возвращаем текущее состояние
  if (!upgrade || upgrade.purchased) {
    console.warn(`Попытка купить недоступное улучшение: ${upgradeId}`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  if (!hasEnoughResources(state, upgrade.cost)) {
    console.warn(`Недостаточно ресурсов для покупки ${upgrade.name}`);
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: Math.max(0, newResources[resourceId].value - cost) // Предотвращаем отрицательные значения
    };
  }
  
  // Помечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  console.log(`Куплено улучшение ${upgrade.name} за:`, upgrade.cost);
  safeDispatchGameEvent(`Исследование "${upgrade.name}" завершено`, "success");
  
  let newState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Применяем специальные эффекты определенных улучшений
  if (upgradeId === 'algorithmOptimization') {
    // Явно обновляем параметры майнинга для "Оптимизация алгоритмов"
    console.log("Применение эффектов 'Оптимизация алгоритмов': +15% к эффективности майнинга");
    newState = {
      ...newState,
      miningParams: {
        ...newState.miningParams,
        // Увеличиваем эффективность майнинга на 15%
        miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.15
      }
    };
  }
  
  if (upgradeId === 'cryptoCurrencyBasics') {
    // Явно обновляем параметры для "Основы криптовалют"
    console.log("Применение эффектов 'Основы криптовалют': +10% к эффективности");
    // Эффекты этого исследования обрабатываются в processApplyKnowledge
  }
  
  // ИСПРАВЛЕНИЕ: Проверяем, является ли это улучшение "Основы блокчейна" или другими вариантами имени
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Применение эффектов 'Основы блокчейна': +50% к максимуму знаний и +10% к получению знаний");
    
    // Увеличиваем максимальное количество знаний
    newState.resources.knowledge = {
      ...newState.resources.knowledge,
      max: newState.resources.knowledge.max * 1.5, // Увеличиваем на 50%
      baseProduction: (newState.resources.knowledge.baseProduction || 0) * 1.1 // Увеличиваем на 10%
    };
    
    console.log(`Новый максимум знаний: ${newState.resources.knowledge.max}`);
    console.log(`Новый базовый прирост знаний: ${newState.resources.knowledge.baseProduction}`);
    
    // НОВОЕ: Явно разблокируем криптокошелек после изучения основ блокчейна
    if (newState.buildings.cryptoWallet) {
      console.log("Разблокируем криптокошелек после изучения Основ блокчейна");
      newState.buildings.cryptoWallet = {
        ...newState.buildings.cryptoWallet,
        unlocked: true
      };
      safeDispatchGameEvent("Открыта возможность приобрести «Криптокошелек»", "success");
    } else {
      console.warn("Здание cryptoWallet отсутствует в состоянии!");
    }
  }
  
  // Применяем эффекты улучшения
  if (upgrade.effects) {
    // Обработка каждого эффекта улучшения
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      if (effectId === 'knowledgeBoost') {
        // Увеличиваем базовый прирост знаний
        const currentBase = newState.resources.knowledge.baseProduction || 0;
        const increase = currentBase * Number(amount);
        
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          baseProduction: currentBase + increase
        };
        
        console.log(`Применен эффект knowledgeBoost: увеличение с ${currentBase} до ${newState.resources.knowledge.baseProduction}`);
      }
      
      if (effectId === 'knowledgeMaxBoost') {
        // Увеличиваем максимум знаний
        const currentMax = newState.resources.knowledge.max;
        const increase = currentMax * Number(amount);
        
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          max: currentMax + increase
        };
        
        console.log(`Применен эффект knowledgeMaxBoost: увеличение с ${currentMax} до ${newState.resources.knowledge.max}`);
      }
      
      if (effectId === 'usdtMaxBoost') {
        // Увеличиваем максимум USDT
        const currentMax = newState.resources.usdt.max;
        const increase = currentMax * Number(amount);
        
        newState.resources.usdt = {
          ...newState.resources.usdt,
          max: currentMax + increase
        };
        
        console.log(`Применен эффект usdtMaxBoost: увеличение с ${currentMax} до ${newState.resources.usdt.max}`);
      }
      
      if (effectId === 'miningEfficiencyBoost') {
        // Увеличиваем эффективность майнинга
        const currentEfficiency = newState.miningParams?.miningEfficiency || 1;
        const newEfficiency = currentEfficiency * (1 + Number(amount));
        
        newState = {
          ...newState,
          miningParams: {
            ...newState.miningParams,
            miningEfficiency: newEfficiency
          }
        };
        
        console.log(`Применен эффект miningEfficiencyBoost: увеличение с ${currentEfficiency} до ${newEfficiency}`);
      }
      
      if (effectId === 'electricityEfficiencyBoost') {
        // Увеличиваем эффективность электричества
        if (newState.resources.electricity) {
          const currentEfficiency = newState.resources.electricity.boosts?.efficiency || 1;
          const newEfficiency = currentEfficiency * (1 + Number(amount));
          
          newState.resources.electricity = {
            ...newState.resources.electricity,
            boosts: {
              ...(newState.resources.electricity.boosts || {}),
              efficiency: newEfficiency
            }
          };
          
          console.log(`Применен эффект electricityEfficiencyBoost: увеличение с ${currentEfficiency} до ${newEfficiency}`);
        }
      }
      
      console.log(`Обработан эффект ${effectId}: ${amount}`);
    }
  }
  
  // После покупки исследования проверяем разблокировки
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};
