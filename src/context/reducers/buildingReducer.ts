
import { GameState } from '../types';
import { canAffordCost, deductResources } from '../../utils/helpers';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

export const processPurchaseBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  // Получаем здание из состояния
  const building = state.buildings[buildingId];
  
  // Если здание не существует или не разблокировано, возвращаем состояние без изменений
  if (!building || !building.unlocked) {
    return state;
  }
  
  // Расчет стоимости с учетом увеличения цены
  const currentCost: { [key: string]: number } = {};
  
  Object.entries(building.cost).forEach(([resourceId, baseAmount]) => {
    currentCost[resourceId] = Math.floor(
      baseAmount * Math.pow(building.costMultiplier, building.count)
    );
  });
  
  // Проверяем, достаточно ли ресурсов
  if (!canAffordCost(currentCost, state.resources)) {
    safeDispatchGameEvent(`Недостаточно ресурсов для покупки ${building.name}`, "error");
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = deductResources(currentCost, state.resources);
  
  // Обновляем количество зданий
  const newBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count + 1
    }
  };
  
  // Проверка на разблокировку исследований после первой покупки генератора
  let newUpgrades = { ...state.upgrades };
  let newUnlocks = { ...state.unlocks };
  let updatedResources = { ...newResources };
  
  // Если это первый генератор, разблокируем исследования и электричество
  if (buildingId === 'generator' && building.count === 0) {
    console.log("Первый генератор куплен! Разблокировка исследований и электричества...");
    
    // Разблокируем первое исследование "Основы блокчейна"
    // ИСПРАВЛЕНО: Проверяем наличие исследования с обоими возможными ID
    if (newUpgrades["blockchain_basics"]) {
      newUpgrades = {
        ...newUpgrades,
        "blockchain_basics": {
          ...newUpgrades["blockchain_basics"],
          unlocked: true
        }
      };
      console.log("Исследование 'Основы блокчейна' (blockchain_basics) разблокировано!");
      safeDispatchGameEvent("Исследование 'Основы блокчейна' разблокировано!", "success");
    } else if (newUpgrades["basicBlockchain"]) {
      newUpgrades = {
        ...newUpgrades,
        "basicBlockchain": {
          ...newUpgrades["basicBlockchain"],
          unlocked: true
        }
      };
      console.log("Исследование 'Основы блокчейна' (basicBlockchain) разблокировано!");
      safeDispatchGameEvent("Исследование 'Основы блокчейна' разблокировано!", "success");
    } else {
      console.warn("Не найдено исследование blockchain_basics или basicBlockchain");
    }
    
    // Открываем вкладку исследований - ИСПРАВЛЕНО: Явно устанавливаем флаг в true
    newUnlocks = {
      ...newUnlocks,
      research: true
    };

    // Для отладки добавляем больше логов
    console.log("Установлен флаг research: true");
    console.log("Текущие разблокированные функции:", Object.entries(newUnlocks).filter(([_, v]) => v).map(([k]) => k).join(', '));
    
    // Принудительная диспетчеризация события разблокировки исследований
    safeDispatchGameEvent("Разблокирована вкладка Исследования!", "success");
    
    // Разблокируем ресурс электричество
    if (state.resources.electricity) {
      updatedResources = {
        ...updatedResources,
        electricity: {
          ...state.resources.electricity,
          unlocked: true,
          value: 0,
          perSecond: 0.5 // Генератор производит 0.5 электричества в секунду
        }
      };
      console.log("Электричество разблокировано!");
      safeDispatchGameEvent("Разблокирован ресурс: Электричество!", "success");
    } else {
      console.error("Ресурс электричество не найден в состоянии!");
    }
    
    // Также активируем все рефералы, если они есть
    if (state.referrals && state.referrals.length > 0) {
      const activatedReferrals = state.referrals.map(ref => ({
        ...ref,
        activated: true
      }));
      
      safeDispatchGameEvent(`${activatedReferrals.length} рефералов активированы!`, "success");
      
      // Обратите внимание, что здесь мы уже возвращаем обновленное состояние
      return {
        ...state,
        resources: updatedResources,
        buildings: newBuildings,
        upgrades: newUpgrades,
        unlocks: newUnlocks,
        referrals: activatedReferrals
      };
    }
  }
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources,
    buildings: newBuildings,
    upgrades: newUpgrades,
    unlocks: newUnlocks
  };
};
