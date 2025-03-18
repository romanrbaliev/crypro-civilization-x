
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
    if (state.upgrades["blockchain_basics"]) {
      newUpgrades = {
        ...newUpgrades,
        "blockchain_basics": {
          ...state.upgrades["blockchain_basics"],
          unlocked: true
        }
      };
    }
    
    // Открываем вкладку исследований
    newUnlocks = {
      ...newUnlocks,
      research: true
    };

    // Добавляем явную запись в консоль для отладки
    console.log("Установлено состояние research:", true);
    console.log("Текущее состояние вкладки research:", state.unlocks.research);
    console.log("Новое состояние вкладки research:", newUnlocks.research);
    
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
