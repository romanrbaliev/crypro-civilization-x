
import { GameState } from '@/context/types';
import { checkAffordability } from './checkAffordability';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { checkAllUnlocks } from '@/utils/unlockManager';
import { EffectsManager } from '@/services/EffectsManager';
import { PurchasableType } from '@/types/purchasable';
import { ResourceSystem } from '@/systems/ResourceSystem';

// Создаем экземпляр ResourceSystem для работы с ресурсами
const resourceSystem = new ResourceSystem();

/**
 * Унифицированная функция для обработки покупок зданий и исследований
 */
export function processPurchase(
  state: GameState, 
  payload: { itemId: string, itemType: PurchasableType }
): GameState {
  const { itemId, itemType } = payload;
  console.log(`[Purchase] Обработка покупки: ${itemType} - ${itemId}`);

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
    console.log(`Текущие ресурсы:`, Object.entries(state.resources)
      .filter(([id]) => Object.keys(item.cost).includes(id))
      .map(([id, r]) => `${id}: ${r.value} (требуется: ${item.cost[id]})`));
    return state;
  }

  // Создаем копию состояния для модификации
  let updatedState = JSON.parse(JSON.stringify(state));

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

    // Обновляем счетчики для определенных зданий
    updateBuildingCounters(updatedState, itemId);

    // Отправляем уведомление
    safeDispatchGameEvent({
      messageKey: 'event.buildingPurchased',
      type: 'success',
      params: { name: item.name }
    });

    console.log(`[Purchase] Здание ${item.name} успешно куплено, новое количество: ${updatedState.buildings[itemId].count}`);

  } else if (itemType === 'upgrade' || itemType === 'research') {
    // Отмечаем улучшение как купленное
    updatedState.upgrades[itemId] = {
      ...item,
      purchased: true
    };

    // Применяем эффекты от улучшения
    if (item.effects) {
      updatedState = EffectsManager.applyEffects(updatedState, item.effects);
      console.log(`[Purchase] Применены эффекты улучшения ${item.name}:`, item.effects);
    }

    // Отправляем уведомление
    safeDispatchGameEvent({
      messageKey: 'event.upgradeCompleted',
      type: 'success',
      params: { name: item.name }
    });
  }

  console.log(`[Purchase] Обновляем производство и потребление после покупки ${item.name}`);
  
  // Обновляем производство и потребление ресурсов
  updatedState = resourceSystem.updateProductionConsumption(updatedState);
  
  // Пересчитываем максимальные значения ресурсов
  updatedState = resourceSystem.updateResourceMaxValues(updatedState);

  // Немедленно проверяем и обновляем все разблокировки
  updatedState = checkAllUnlocks(updatedState);

  // Принудительно обновляем значения ресурсов (для мгновенного эффекта)
  updatedState = resourceSystem.updateResources(updatedState, 0);

  // Выводим отладочную информацию
  console.log(`[Purchase] ${item.name} успешно приобретено.`);
  console.log(`[ResourceDebug] Производство/потребление ресурсов после покупки:`, 
    Object.entries(updatedState.resources)
      .filter(([_, r]) => r.unlocked && r.perSecond !== 0)
      .map(([id, r]) => `${id}: ${r.perSecond.toFixed(2)}/сек`)
  );
  
  // Выводим текущие значения ресурсов
  console.log(`[ResourceDebug] Текущие значения ресурсов после покупки:`, 
    Object.entries(updatedState.resources)
      .filter(([_, r]) => r.unlocked)
      .map(([id, r]) => `${id}: ${r.value.toFixed(2)}/${r.max || '∞'} (${r.perSecond.toFixed(2)}/сек)`)
  );

  return updatedState;
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
