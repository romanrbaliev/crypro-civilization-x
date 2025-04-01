import { GameState, Building } from '../types';
import { toast } from '@/components/ui/use-toast';
import { formatResourceValue } from '@/utils/resourceFormatConfig';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Функция для вычисления текущей стоимости здания
const calculateBuildingCost = (building: Building): { [key: string]: number } => {
  const baseCost = { ...building.cost };
  const multiplier = building.costMultiplier || 1.15;
  const count = building.count || 0;
  
  // Умножаем базовую стоимость на множитель роста цены
  const scaledCost: { [key: string]: number } = {};
  for (const [resourceId, cost] of Object.entries(baseCost)) {
    scaledCost[resourceId] = Math.floor(Number(cost) * Math.pow(multiplier, count));
  }
  
  return scaledCost;
};

// Обработчик покупки здания
export const processPurchaseBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
  
  // Проверяем, существует ли такое здание
  if (!state.buildings[buildingId]) {
    console.log(`Здание с ID ${buildingId} не найдено`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  
  // Проверяем, разблокировано ли здание
  if (!building.unlocked) {
    console.log(`Здание ${building.name} еще не разблокировано`);
    return state;
  }
  
  // Вычисляем текущую стоимость здания
  const currentCost = calculateBuildingCost(building);
  
  // Проверяем, достаточно ли ресурсов для покупки
  for (const [resourceId, cost] of Object.entries(currentCost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < cost) {
      console.log(`Недостаточно ресурса ${resourceId} для покупки ${building.name}`);
      return state;
    }
  }
  
  // Создаем копии для изменения
  const updatedResources = { ...state.resources };
  
  // Вычитаем стоимость
  for (const [resourceId, cost] of Object.entries(currentCost)) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - cost
    };
  }
  
  // Если это первый генератор, разблокируем электричество
  if (buildingId === 'generator' && building.count === 0) {
    // Разблокируем ресурс электричества, если его еще нет
    if (!state.resources.electricity || !state.resources.electricity.unlocked) {
      console.log("🔌 Разблокировка электричества при покупке первого генератора");
      
      updatedResources.electricity = {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 100,
        unlocked: true
      };
      
      // Обновляем флаг разблокировки
      state = {
        ...state,
        unlocks: {
          ...state.unlocks,
          electricity: true
        }
      };
      
      safeDispatchGameEvent("Разблокирован ресурс: Электричество!", "success");
    }
  }
  
  // Обновляем здание
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: (building.count || 0) + 1
    }
  };
  
  // Логируем покупку
  const costString = Object.entries(currentCost)
    .map(([resourceId, cost]) => `${formatResourceValue(cost, resourceId)} ${state.resources[resourceId]?.name || resourceId}`)
    .join(", ");
    
  console.log(`Куплено здание ${building.name} за ${costString}`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources,
    buildings: updatedBuildings
  };
};

// Обработчик продажи здания
export const processSellBuilding = (state: GameState, payload: { buildingId: string }): GameState => {
  const { buildingId } = payload;
  
  // Проверяем, существует ли такое здание
  if (!state.buildings[buildingId]) {
    console.log(`Здание с ID ${buildingId} не найдено`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  
  // Проверяем, есть ли что продавать
  if (!building.count || building.count <= 0) {
    console.log(`Нечего продавать: здание ${building.name} отсутствует`);
    return state;
  }
  
  // Определяем стоимость возврата ресурсов (50% от текущей стоимости)
  const currentCost = calculateBuildingCost(building);
  const refundMultiplier = 0.5;
  
  // Создаем копии для изменения
  const updatedResources = { ...state.resources };
  
  // Возвращаем ресурсы
  for (const [resourceId, cost] of Object.entries(currentCost)) {
    const refund = Math.floor(Number(cost) * refundMultiplier);
    
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value + refund
    };
  }
  
  // Обновляем здание
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      count: building.count - 1
    }
  };
  
  // Логируем продажу
  console.log(`Продано здание ${building.name}, возвращено ресурсов: ${refundMultiplier * 100}%`);
  
  // Возвращаем обновленное состояние
  return {
    ...state,
    resources: updatedResources,
    buildings: updatedBuildings
  };
};

// Обработчик выбора специализации
export const processChooseSpecialization = (state: GameState, payload: { roleId: string }): GameState => {
  const { roleId } = payload;
  
  // Проверяем, что специализация еще не выбрана
  if (state.specialization) {
    console.log(`Специализация уже выбрана: ${state.specialization}`);
    return state;
  }
  
  // Проверяем, что такая специализация существует
  const availableSpecializations = ['miner', 'trader', 'scientist'];
  if (!availableSpecializations.includes(roleId)) {
    console.log(`Недопустимая специализация: ${roleId}`);
    return state;
  }
  
  // Применяем специализацию
  const newState = {
    ...state,
    specialization: roleId
  };
  
  console.log(`Выбрана специализация: ${roleId}`);
  
  return newState;
};
