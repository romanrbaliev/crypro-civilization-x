import { GameState } from '../types';
import { hasEnoughResources } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Функция для обработки покупки здания
export const processPurchaseBuilding = (
  state: GameState, 
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  // Проверяем, существует ли такое здание
  if (!state.buildings[buildingId]) {
    console.log(`Здание с ID ${buildingId} не найдено`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  
  // Проверяем, разблокировано ли здание
  if (!building.unlocked) {
    console.log(`Здание ${building.name} не разблокировано`);
    return state;
  }
  
  // Получаем стоимость с учетом текущего количества
  let currentCost = { ...building.cost };
  
  // Масштабируем стоимость в зависимости от количества
  if (building.count > 0 && building.costMultiplier) {
    const scaling = building.costMultiplier;
    for (const resourceId in currentCost) {
      if (typeof currentCost[resourceId] === 'number' && typeof scaling === 'number') {
        currentCost[resourceId] = currentCost[resourceId] * Math.pow(scaling, building.count);
      }
    }
  }
  
  // Проверка наличия ресурсов
  if (!hasEnoughResources(state, currentCost)) {
    console.log(`Недостаточно ресурсов для покупки ${building.name}`);
    return state;
  }
  
  // Создаем копии для изменения
  let updatedResources = { ...state.resources };
  
  // Вычитаем стоимость здания
  for (const resourceId in currentCost) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(currentCost[resourceId])
    };
  }
  
  // Обновляем здание (увеличиваем счетчик)
  const updatedBuilding = {
    ...building,
    count: building.count + 1
  };
  
  // Объединяем все изменения в новое состояние
  let newState = {
    ...state,
    resources: updatedResources,
    buildings: {
      ...state.buildings,
      [buildingId]: updatedBuilding
    }
  };
  
  // Специальная обработка для некоторых зданий
  if (buildingId === 'homeComputer') {
    // Разблокируем вычислительную мощность, если ещё не разблокирована
    if (!newState.unlocks.computingPower) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          computingPower: true
        }
      };
      
      // Создаем ресурс computingPower, если его нет
      if (!newState.resources.computingPower) {
        newState.resources.computingPower = {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Вычислительная мощность для майнинга',
          type: 'resource',
          icon: 'cpu',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 1000,
          unlocked: true
        };
      } else {
        newState.resources.computingPower.unlocked = true;
      }
      
      safeDispatchGameEvent('Разблокирована вычислительная мощность!', 'success');
    }
  } 
  else if (buildingId === 'generator') {
    // Разблокируем электричество, если ещё не разблокировано
    if (!newState.unlocks.electricity) {
      newState = {
        ...newState,
        unlocks: {
          ...newState.unlocks,
          electricity: true
        }
      };
      
      // Создаем ресурс электричества, если его нет
      if (!newState.resources.electricity) {
        newState.resources.electricity = {
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
      } else {
        newState.resources.electricity.unlocked = true;
      }
      
      safeDispatchGameEvent('Разблокировано электричество!', 'success');
    }
  }
  
  // Отправляем уведомление о покупке
  safeDispatchGameEvent(`Приобретено здание: ${building.name}`, "success");
  
  // Увеличиваем счетчик купленных зданий
  newState = {
    ...newState,
    counters: {
      ...newState.counters,
      totalBuildings: {
        ...(typeof newState.counters.totalBuildings === 'object' ? newState.counters.totalBuildings : { id: 'totalBuildings', name: 'Всего зданий', value: 0 }),
        value: (typeof newState.counters.totalBuildings === 'object' ? newState.counters.totalBuildings.value : 0) + 1
      }
    }
  };
  
  return newState;
};

// Функция для обработки продажи здания
export const processSellBuilding = (
  state: GameState, 
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  // Проверяем, существует ли такое здание
  if (!state.buildings[buildingId]) {
    console.log(`Здание с ID ${buildingId} не найдено`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  
  // Проверяем, есть ли здания для продажи
  if (building.count <= 0) {
    console.log(`У вас нет зданий ${building.name} для продажи`);
    return state;
  }
  
  // Получаем стоимость продажи (50% от текущей стоимости)
  let sellValue = { ...building.cost };
  
  // Масштабируем стоимость в зависимости от количества
  if (building.count > 1 && building.costMultiplier) {
    const scaling = building.costMultiplier;
    for (const resourceId in sellValue) {
      if (typeof sellValue[resourceId] === 'number' && typeof scaling === 'number') {
        sellValue[resourceId] = sellValue[resourceId] * Math.pow(scaling, building.count - 1) * 0.5; // 50% возврат
      } else {
        sellValue[resourceId] = Number(sellValue[resourceId]) * 0.5; // 50% возврат
      }
    }
  } else {
    // Для первого здания - просто 50%
    for (const resourceId in sellValue) {
      sellValue[resourceId] = Number(sellValue[resourceId]) * 0.5;
    }
  }
  
  // Создаем копии для изменения
  let updatedResources = { ...state.resources };
  
  // Возвращаем часть стоимости
  for (const resourceId in sellValue) {
    if (updatedResources[resourceId]) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        value: updatedResources[resourceId].value + Number(sellValue[resourceId])
      };
      
      // Ограничиваем значение максимумом
      if (updatedResources[resourceId].max !== undefined && updatedResources[resourceId].max !== Infinity) {
        updatedResources[resourceId].value = Math.min(
          updatedResources[resourceId].value, 
          updatedResources[resourceId].max
        );
      }
    }
  }
  
  // Обновляем здание (уменьшаем счетчик)
  const updatedBuilding = {
    ...building,
    count: building.count - 1
  };
  
  // Объединяем все изменения в новое состояние
  const newState = {
    ...state,
    resources: updatedResources,
    buildings: {
      ...state.buildings,
      [buildingId]: updatedBuilding
    }
  };
  
  // Отправляем уведомление о продаже
  safeDispatchGameEvent(`Продано здание: ${building.name}`, "info");
  
  return newState;
};

// Функция для обработки выбора специализации
export const processChooseSpecialization = (
  state: GameState,
  payload: { specializationType: string }
): GameState => {
  const { specializationType } = payload;
  
  if (!specializationType) {
    console.log('Тип специализации не указан');
    return state;
  }
  
  // Проверяем, доступен ли выбор специализации
  if (state.phase < 3) {
    console.log('Выбор специализации недоступен на текущей фазе игры');
    return state;
  }
  
  // Проверяем, была ли уже выбрана специализация
  if (state.specialization && !state.prestigePoints) {
    console.log('Специализация уже выбрана. Для изменения требуется престиж.');
    return state;
  }
  
  // Проверяем корректность типа специализации
  const validTypes = ['miner', 'trader', 'investor', 'analyst', 'influencer'];
  if (!validTypes.includes(specializationType)) {
    console.log(`Некорректный тип специализации: ${specializationType}`);
    return state;
  }
  
  // Отправляем уведомление о выборе специализации
  let specializationName = '';
  switch (specializationType) {
    case 'miner':
      specializationName = 'Майнер';
      break;
    case 'trader':
      specializationName = 'Трейдер';
      break;
    case 'investor':
      specializationName = 'Инвестор';
      break;
    case 'analyst':
      specializationName = 'Аналитик';
      break;
    case 'influencer':
      specializationName = 'Инфлюенсер';
      break;
  }
  
  safeDispatchGameEvent(`Выбрана специализация: ${specializationName}`, "success");
  
  // Обновляем состояние с выбранной специализацией
  return {
    ...state,
    specialization: specializationType
  };
};
