
import { GameState, Upgrade } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions } from '@/utils/researchUtils';
import { checkUpgradeUnlocks, UNLOCK_SEQUENCES } from '@/utils/unlockSystem';

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
      value: newResources[resourceId].value - cost
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
  
  console.log(`Куплено улучшение ${upgrade.name}`);
  
  // Применяем эффекты улучшения
  if (upgrade.effects) {
    // Обработка каждого эффекта улучшения
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      if (effectId === 'knowledgeBoost') {
        // Увеличиваем базовый прирост знаний
        newResources.knowledge = {
          ...newResources.knowledge,
          baseProduction: newResources.knowledge.baseProduction + Number(amount)
        };
      }
      
      if (effectId === 'knowledgeMaxBoost') {
        // Увеличиваем максимум знаний
        newResources.knowledge = {
          ...newResources.knowledge,
          max: newResources.knowledge.max + Number(amount)
        };
      }
      
      if (effectId === 'usdtMaxBoost') {
        // Увеличиваем максимум USDT
        newResources.usdt = {
          ...newResources.usdt,
          max: newResources.usdt.max + Number(amount)
        };
      }
      
      // Другие эффекты...
    }
  }
  
  let newState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // После покупки исследования проверяем разблокировки
  // Используем новую систему вместо хардкодированных проверок
  newState = checkUpgradeUnlocks(newState);
  
  return newState;
};
