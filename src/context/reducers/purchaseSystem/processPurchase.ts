
import { GameState } from '@/context/types';
import { checkAffordability } from './checkAffordability';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { EffectsManager } from '@/services/EffectsManager';
import { PurchasableType } from '@/types/purchasable';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр ResourceSystem для проверки доступности ресурсов
const resourceSystem = new ResourceSystem();

/**
 * Унифицированная функция для обработки покупок зданий и исследований
 */
export function processPurchase(
  state: GameState, 
  payload: { itemId: string, itemType: PurchasableType }
): GameState {
  const { itemId, itemType } = payload;

  // Определение типа покупаемого элемента
  let item;
  if (itemType === 'building') {
    item = state.buildings[itemId];
  } else if (itemType === 'upgrade' || itemType === 'research') {
    item = state.upgrades[itemId];
  } else {
    console.error(`Неизвестный тип элемента: ${itemType}`);
    return state;
  }

  // Проверка существования элемента
  if (!item) {
    console.error(`Элемент с ID ${itemId} не найден в категории ${itemType}`);
    return state;
  }

  // Для исследований проверяем, что оно еще не куплено
  if ((itemType === 'upgrade' || itemType === 'research') && item.purchased) {
    console.log(`Исследование ${item.name} уже куплено`);
    return state;
  }

  // Проверка валидности объекта стоимости
  if (!item.cost || typeof item.cost !== 'object' || Object.keys(item.cost).length === 0) {
    console.error(`Элемент ${itemId} имеет некорректную стоимость`, item.cost);
    return state;
  }

  // Проверка наличия ресурсов для покупки
  if (!resourceSystem.checkAffordability(state, item.cost)) {
    console.log(`Недостаточно ресурсов для покупки ${item.name}`);
    return state;
  }

  // Создаем копию состояния для модификации
  let updatedState = { ...state };

  // Списываем ресурсы
  for (const [resourceId, amount] of Object.entries(item.cost)) {
    updatedState.resources[resourceId] = {
      ...updatedState.resources[resourceId],
      value: updatedState.resources[resourceId].value - Number(amount)
    };
  }

  // Обработка покупки в зависимости от типа
  if (itemType === 'building') {
    // Рассчитываем новую стоимость здания
    const newCost = { ...item.cost };
    for (const [resourceId, amount] of Object.entries(item.cost)) {
      newCost[resourceId] = Math.floor(Number(amount) * item.costMultiplier);
    }

    // Обновляем здание
    updatedState.buildings[itemId] = {
      ...item,
      count: item.count + 1,
      cost: newCost
    };

    // Обновляем производство ресурсов
    if (item.production) {
      const productionMultiplier = 1; // Базовый множитель
      
      for (const [resourceId, amount] of Object.entries(item.production)) {
        if (updatedState.resources[resourceId]) {
          updatedState.resources[resourceId] = {
            ...updatedState.resources[resourceId],
            production: (updatedState.resources[resourceId].production || 0) + 
                       Number(amount) * productionMultiplier
          };
        }
      }
    }

    // Обновляем потребление ресурсов
    if (item.consumption) {
      for (const [resourceId, amount] of Object.entries(item.consumption)) {
        if (updatedState.resources[resourceId]) {
          updatedState.resources[resourceId] = {
            ...updatedState.resources[resourceId],
            consumption: (updatedState.resources[resourceId].consumption || 0) + 
                        Number(amount)
          };
        }
      }
    }

    // Обновляем счетчики для определенных зданий
    updateBuildingCounters(updatedState, itemId);

    // Отправляем уведомление
    safeDispatchGameEvent({
      messageKey: 'event.buildingPurchased',
      type: 'success',
      params: { name: item.name }
    });

  } else if (itemType === 'upgrade' || itemType === 'research') {
    // Отмечаем улучшение как купленное
    updatedState.upgrades[itemId] = {
      ...item,
      purchased: true
    };

    // Применяем эффекты от улучшения
    if (item.effects) {
      updatedState = EffectsManager.applyEffects(updatedState, item.effects);
    }

    // Отправляем уведомление
    safeDispatchGameEvent({
      messageKey: 'event.upgradeCompleted',
      type: 'success',
      params: { name: item.name }
    });
  }

  // Пересчитываем максимальные значения ресурсов
  updatedState = resourceSystem.updateResourceMaxValues(updatedState);
  
  // Пересчитываем perSecond для всех ресурсов
  for (const resourceId in updatedState.resources) {
    const resource = updatedState.resources[resourceId];
    if (resource.unlocked) {
      updatedState.resources[resourceId] = {
        ...resource,
        perSecond: (resource.production || 0) - (resource.consumption || 0)
      };
    }
  }

  // Немедленно проверяем и обновляем все разблокировки
  updatedState = checkAllUnlocks(updatedState);

  // Форсированно обновляем ресурсы для немедленного отображения изменений
  return resourceSystem.updateResources(updatedState, 0);
}

/**
 * Обновляет счетчики построенных зданий
 */
function updateBuildingCounters(state: GameState, buildingId: string): void {
  if (buildingId === 'practice') {
    state.counters.practiceBuilt = {
      id: 'practiceBuilt',
      value: (state.counters.practiceBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'generator') {
    state.counters.generatorBuilt = {
      id: 'generatorBuilt',
      value: (state.counters.generatorBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'homeComputer') {
    state.counters.computerBuilt = {
      id: 'computerBuilt',
      value: (state.counters.computerBuilt?.value || 0) + 1
    };
  } else if (buildingId === 'cryptoWallet') {
    state.counters.walletBuilt = {
      id: 'walletBuilt',
      value: (state.counters.walletBuilt?.value || 0) + 1
    };
  }
}
