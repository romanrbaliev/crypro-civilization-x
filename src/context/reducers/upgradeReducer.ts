import { GameState, Upgrade } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { unlockRelatedUpgrades, unlockRelatedBuildings } from '@/utils/researchUtils';
import { checkUpgradeUnlocks, checkAllUnlocks } from '@/utils/unlockManager';

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
  
  // ЦЕНТРАЛИЗОВАННАЯ РАЗБЛОКИРОВКА связанных исследований
  newState = unlockRelatedUpgrades(newState, upgradeId);
  
  // ЦЕНТРАЛИЗОВАННАЯ РАЗБЛОКИРОВКА связанных зданий
  newState = unlockRelatedBuildings(newState, upgradeId);
  
  // После покупки исследования проверяем все возможные разблокировки в централизованной системе
  newState = checkAllUnlocks(newState);
  
  // Особая обработка для "Основы блокчейна" - сразу применяем эффекты
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Применяем эффекты Основ блокчейна немедленно");
    
    // Обновляем максимум знан��й
    if (newState.resources.knowledge) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newState.resources.knowledge.max * 1.5 // +50% к максимуму
      };
    }
    
    // Принудительно запускаем пересчет ресурсов через GameStateService
    // Эта логика будет применена в gameReducer через GameStateService
  }
  
  return newState;
};

// Выделенная функция для применения эффектов улучшений
function applyUpgradeEffects(state: GameState, upgradeId: string, upgrade: Upgrade): GameState {
  let newState = { ...state };
  
  // Применяем эффекты для конкретных улучшений
  if (upgradeId === 'algorithmOptimization') {
    console.log("Применение эффектов 'Оптимизация алгоритмов': +15% к эффективности майнинга");
    newState = {
      ...newState,
      miningParams: {
        ...newState.miningParams,
        miningEfficiency: (newState.miningParams?.miningEfficiency || 1) * 1.15
      }
    };
  }
  
  if (upgradeId === 'cryptoCurrencyBasics') {
    console.log("Применение эффектов 'Основы криптовалют': +10% к эффективности");
    // Эффекты этого исследования обрабатываются в processApplyKnowledge
  }
  
  // Исправление для основ блокчейна - применяем эффекты явно
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Применение эффектов 'Основы блокчейна': +50% к максимуму знаний и +10% к получению знаний");
    
    // Увеличиваем максимальное количество знаний на 50%
    if (newState.resources.knowledge) {
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newState.resources.knowledge.max * 1.5,
        // Добавляем или увеличиваем базовое производство на 10%
        baseProduction: ((newState.resources.knowledge.baseProduction || 0) + 0.1)
      };
    }
    
    console.log(`Новый максимум знаний: ${newState.resources.knowledge?.max}`);
    console.log(`Новое базовое производство знаний: ${newState.resources.knowledge?.baseProduction}`);
  }
  
  // Применяем общие эффекты улучшения
  if (upgrade.effects) {
    // Обработка каждого эффекта улучшения
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      if (effectId === 'knowledgeBoost') {
        // Увеличиваем базовый прирост знаний
        const currentBase = newState.resources.knowledge.baseProduction || 0;
        const increase = Number(amount);
        
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          baseProduction: currentBase + increase
        };
        
        console.log(`Применен эффект knowledgeBoost (+${increase}): увеличение с ${currentBase} до ${newState.resources.knowledge.baseProduction}`);
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
  
  return newState;
}

// Необходимый импорт для обновления ресурсов
import { ResourceProductionService } from '@/services/ResourceProductionService';
