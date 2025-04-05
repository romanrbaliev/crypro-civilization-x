
import { GameState } from '@/types/game';

/**
 * Обработчик покупки улучшения
 */
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Проверяем наличие улучшения и возможность его приобретения
  if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
    console.warn(`Нельзя купить улучшение: ${upgradeId}`);
    return state;
  }
  
  // Проверяем достаточно ли ресурсов
  for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < cost) {
      console.warn(`Недостаточно ресурсов для покупки улучшения: ${upgradeId}`);
      return state;
    }
  }
  
  // Копируем текущие ресурсы и вычитаем стоимость улучшения
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: newResources[resourceId].value - cost
    };
  }
  
  // Отмечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  // Обновляем счетчик купленных улучшений
  const newCounters = {
    ...state.counters,
    upgradesPurchased: {
      ...state.counters.upgradesPurchased,
      value: state.counters.upgradesPurchased.value + 1
    }
  };
  
  // Применяем эффекты улучшения
  let newState = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades,
    counters: newCounters
  };
  
  // Применяем специальные эффекты в зависимости от типа улучшения
  if (upgrade.effects) {
    switch (upgradeId) {
      case 'blockchainBasics':
        // Увеличиваем максимальное количество знаний
        if (upgrade.effects.maxKnowledgeMultiplier) {
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: newState.resources.knowledge.max * upgrade.effects.maxKnowledgeMultiplier
          };
        }
        
        // Увеличиваем производство знаний
        if (upgrade.effects.knowledgeProductionMultiplier) {
          // Обновляем множитель производства знаний для всех зданий
          const newBuildings = { ...newState.buildings };
          for (const buildingId in newBuildings) {
            const building = newBuildings[buildingId];
            if (building.production && building.production.knowledge) {
              building.production = {
                ...building.production,
                knowledge: building.production.knowledge * upgrade.effects.knowledgeProductionMultiplier
              };
            }
          }
          newState.buildings = newBuildings;
        }
        break;
        
      case 'walletSecurity':
        // Увеличиваем максимальное количество USDT
        if (upgrade.effects.maxUsdtMultiplier) {
          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: newState.resources.usdt.max * upgrade.effects.maxUsdtMultiplier
          };
        }
        break;
        
      case 'internetConnection':
        // Увеличиваем производство знаний
        if (upgrade.effects.knowledgeProductionMultiplier) {
          const newBuildings = { ...newState.buildings };
          for (const buildingId in newBuildings) {
            const building = newBuildings[buildingId];
            if (building.production && building.production.knowledge) {
              building.production = {
                ...building.production,
                knowledge: building.production.knowledge * upgrade.effects.knowledgeProductionMultiplier
              };
            }
          }
          newState.buildings = newBuildings;
        }
        
        // Увеличиваем эффективность вычислительной мощности
        if (upgrade.effects.computingPowerMultiplier) {
          const newBuildings = { ...newState.buildings };
          for (const buildingId in newBuildings) {
            const building = newBuildings[buildingId];
            if (building.production && building.production.computingPower) {
              building.production = {
                ...building.production,
                computingPower: building.production.computingPower * upgrade.effects.computingPowerMultiplier
              };
            }
          }
          newState.buildings = newBuildings;
        }
        break;
        
      default:
        // Для других улучшений просто применяем общие эффекты
        // Это может быть расширено в будущем
        break;
    }
  }
  
  // Проверяем условия разблокировки других улучшений или зданий
  newState = checkUpgradeUnlocks(newState, upgradeId);
  
  return newState;
};

/**
 * Проверяет и разблокирует новые улучшения, здания или ресурсы
 * в зависимости от купленного улучшения
 */
function checkUpgradeUnlocks(state: GameState, purchasedUpgradeId: string): GameState {
  let newState = { ...state };
  
  switch (purchasedUpgradeId) {
    case 'blockchainBasics':
      // Разблокируем криптокошелек
      if (newState.buildings.cryptoWallet) {
        newState.buildings = {
          ...newState.buildings,
          cryptoWallet: {
            ...newState.buildings.cryptoWallet,
            unlocked: true
          }
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          cryptoWallet: true
        };
      }
      
      // Разблокируем "Безопасность криптокошельков"
      if (newState.upgrades.walletSecurity) {
        newState.upgrades = {
          ...newState.upgrades,
          walletSecurity: {
            ...newState.upgrades.walletSecurity,
            unlocked: true
          }
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          walletSecurity: true
        };
      }
      break;
      
    case 'walletSecurity':
      // Может разблокировать другие улучшения в будущем
      break;
      
    case 'internetConnection':
      // Может разблокировать другие улучшения в будущем
      break;
  }
  
  return newState;
}

/**
 * Устанавливает состояние разблокировки улучшения
 */
export const processSetUpgradeUnlocked = (
  state: GameState,
  payload: { upgradeId: string; unlocked: boolean }
): GameState => {
  const { upgradeId, unlocked } = payload;
  
  if (!state.upgrades[upgradeId]) {
    console.warn(`Улучшение ${upgradeId} не существует`);
    return state;
  }
  
  // Обновляем состояние разблокировки улучшения
  return {
    ...state,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...state.upgrades[upgradeId],
        unlocked
      }
    },
    unlocks: {
      ...state.unlocks,
      [upgradeId]: unlocked
    }
  };
};
