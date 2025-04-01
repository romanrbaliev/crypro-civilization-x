import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Функция для обработки покупки улучшения
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  
  // Проверяем, существует ли такое улучшение
  if (!state.upgrades[upgradeId]) {
    console.log(`Улучшение с ID ${upgradeId} не найдено`);
    return state;
  }
  
  const upgrade = state.upgrades[upgradeId];
  
  // Проверяем, разблокировано ли улучшение
  if (!upgrade.unlocked) {
    console.log(`Улучшение ${upgrade.name} не разблокировано`);
    return state;
  }
  
  // Проверяем, куплено ли уже улучшение
  if (upgrade.purchased) {
    console.log(`Улучшение ${upgrade.name} уже куплено`);
    return state;
  }
  
  // Проверяем наличие ресурсов
  if (!upgrade.cost) {
    console.log(`Улучшение ${upgrade.name} не имеет стоимости`);
    return state;
  }
  
  let currentCost = { ...upgrade.cost };
  
  // Проверка наличия ресурсов
  let hasEnough = true;
  for (const resourceId in currentCost) {
    if (state.resources[resourceId].value < currentCost[resourceId]) {
      console.log(`Недостаточно ресурсов для покупки ${upgrade.name}`);
      hasEnough = false;
      break;
    }
  }
  
  if (!hasEnough) {
    return state;
  }
  
  // Создаем копии для изменения
  let updatedResources = { ...state.resources };
  
  // Вычитаем стоимость улучшения
  for (const resourceId in currentCost) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(currentCost[resourceId])
    };
  }
  
  let updatedState = {
    ...state,
    resources: updatedResources,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: {
        ...upgrade,
        purchased: true
      }
    }
  };
  
  // Применяем эффекты улучшения
  if (upgrade.effects) {
    for (const effectId in upgrade.effects) {
      const effectValue = upgrade.effects[effectId];
      
      switch (effectId) {
        case 'knowledgeMaxBoost':
          // Увеличиваем максимальное значение знаний
          updatedState = {
            ...updatedState,
            resources: {
              ...updatedState.resources,
              knowledge: {
                ...updatedState.resources.knowledge,
                max: updatedState.resources.knowledge.max + effectValue
              }
            }
          };
          break;
          
        case 'knowledgeBoost':
          // Увеличиваем производство знаний
          updatedState = {
            ...updatedState,
            resources: {
              ...updatedState.resources,
              knowledge: {
                ...updatedState.resources.knowledge,
                baseProduction: updatedState.resources.knowledge.baseProduction + effectValue
              }
            }
          };
          break;
          
        case 'usdtMaxBoost':
          // Увеличиваем максимальное значение USDT
          if (updatedState.resources.usdt) {
            updatedState = {
              ...updatedState,
              resources: {
                ...updatedState.resources,
                usdt: {
                  ...updatedState.resources.usdt,
                  max: updatedState.resources.usdt.max + effectValue
                }
              }
            };
          }
          break;
          
        case 'miningEfficiency':
          // Увеличиваем эффективность майнинга
          if (updatedState.miningParams) {
            updatedState = {
              ...updatedState,
              miningParams: {
                ...updatedState.miningParams,
                miningEfficiency: updatedState.miningParams.miningEfficiency + effectValue
              }
            };
          }
          break;
          
        case 'energyEfficiency':
          // Увеличиваем энергоэффективность
          if (updatedState.miningParams) {
            updatedState = {
              ...updatedState,
              miningParams: {
                ...updatedState.miningParams,
                energyEfficiency: updatedState.miningParams.energyEfficiency + effectValue
              }
            };
          }
          break;
          
        case 'computingPowerConsumptionReduction':
          // Уменьшаем потребление энергии компьютерами
          if (updatedState.buildings.homeComputer) {
            updatedState = {
              ...updatedState,
              buildings: {
                ...updatedState.buildings,
                homeComputer: {
                  ...updatedState.buildings.homeComputer,
                  consumption: {
                    ...updatedState.buildings.homeComputer.consumption,
                    electricity: updatedState.buildings.homeComputer.consumption.electricity * (1 - effectValue)
                  }
                }
              }
            };
          }
          break;
          
        case 'unlockTrading':
          // Разблокируем возможность обмена криптовалюты
          updatedState.unlocks.trading = 1;
          break;
          
        case 'autoBtcExchange':
          // Разблокируем автоматический обмен BTC
          updatedState.unlocks.autoBtcExchange = 1;
          break;
          
        default:
          console.warn(`Неизвестный эффект улучшения: ${effectId}`);
      }
    }
  }
  
  // Отправляем уведомление о покупке
  safeDispatchGameEvent(`Приобретено улучшение: ${upgrade.name}`, "success");
  
  return updatedState;
};
