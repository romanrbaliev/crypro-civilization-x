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
  
  // Применяем эффекты улучшения
  if (upgrade.effects) {
    // Обработка каждого эффекта улучшения
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      if (effectId === 'knowledgeBoost') {
        // Увеличиваем базовый прирост знаний
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          baseProduction: (newState.resources.knowledge.baseProduction || 0) + Number(amount)
        };
      }
      
      if (effectId === 'knowledgeMaxBoost') {
        // Увеличиваем максимум знаний
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          max: newState.resources.knowledge.max + Number(amount)
        };
      }
      
      if (effectId === 'usdtMaxBoost') {
        // Увеличиваем максимум USDT
        newState.resources.usdt = {
          ...newState.resources.usdt,
          max: newState.resources.usdt.max + Number(amount)
        };
      }
      
      console.log(`Применен эффект ${effectId}: ${amount}`);
    }
  }
  
  // После покупки исследования проверяем разблокировки
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};
