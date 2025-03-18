import { GameState } from '../types';
import { Building } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';

// Функция для разблокировки здания
const processUnlockBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  if (!state.buildings[buildingId]) {
    console.warn(`Здание ${buildingId} не найдено.`);
    return state;
  }
  
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...state.buildings[buildingId],
      unlocked: true
    }
  };
  
  console.log(`Здание ${buildingId} успешно разблокировано.`);
  safeDispatchGameEvent(`Здание ${buildingId} разблокировано!`, 'success');
  
  return {
    ...state,
    buildings: updatedBuildings
  };
};

// Функция для покупки здания
const processBuyBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  if (!state.buildings[buildingId]) {
    console.warn(`Здание ${buildingId} не найдено.`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  if (!building.unlocked) {
    console.warn(`Здание ${buildingId} заблокировано и не может быть куплено.`);
    safeDispatchGameEvent(`Здание ${buildingId} заблокировано!`, 'warning');
    return state;
  }
  
  const cost = building.cost;
  for (const resourceId in cost) {
    if (state.resources[resourceId].value < cost[resourceId]) {
      console.warn(`Недостаточно ресурсов для покупки здания ${buildingId}.`);
      safeDispatchGameEvent(`Недостаточно ${state.resources[resourceId].label}!`, 'warning');
      return state;
    }
  }
  
  let updatedResources = { ...state.resources };
  for (const resourceId in cost) {
    updatedResources = {
      ...updatedResources,
      [resourceId]: {
        ...updatedResources[resourceId],
        value: updatedResources[resourceId].value - cost[resourceId]
      }
    };
  }
  
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      level: building.level + 1
    }
  };
  
  console.log(`Здание ${buildingId} успешно куплено и улучшено до уровня ${updatedBuildings[buildingId].level}.`);
  safeDispatchGameEvent(`Здание ${buildingId} улучшено!`, 'success');
  
  return {
    ...state,
    resources: updatedResources,
    buildings: updatedBuildings
  };
};

// Функция для апгрейда здания
const processUpgradeBuilding = (
  state: GameState,
  payload: { buildingId: string }
): GameState => {
  const { buildingId } = payload;
  
  if (!state.buildings[buildingId]) {
    console.warn(`Здание ${buildingId} не найдено.`);
    return state;
  }
  
  const building = state.buildings[buildingId];
  if (!building.unlocked) {
    console.warn(`Здание ${buildingId} заблокировано и не может быть улучшено.`);
    safeDispatchGameEvent(`Здание ${buildingId} заблокировано!`, 'warning');
    return state;
  }
  
  const upgradeCost = building.upgradeCost;
  if (!upgradeCost) {
    console.warn(`Для здания ${buildingId} нет стоимости улучшения.`);
    safeDispatchGameEvent(`Для ${building.label} нет улучшений!`, 'info');
    return state;
  }
  
  for (const resourceId in upgradeCost) {
    if (state.resources[resourceId].value < upgradeCost[resourceId]) {
      console.warn(`Недостаточно ресурсов для улучшения здания ${buildingId}.`);
      safeDispatchGameEvent(`Недостаточно ${state.resources[resourceId].label}!`, 'warning');
      return state;
    }
  }
  
  let updatedResources = { ...state.resources };
  for (const resourceId in upgradeCost) {
    updatedResources = {
      ...updatedResources,
      [resourceId]: {
        ...updatedResources[resourceId],
        value: updatedResources[resourceId].value - upgradeCost[resourceId]
      }
    };
  }
  
  const updatedBuildings = {
    ...state.buildings,
    [buildingId]: {
      ...building,
      upgradeLevel: building.upgradeLevel ? building.upgradeLevel + 1 : 1
    }
  };
  
  console.log(`Здание ${buildingId} успешно улучшено до уровня ${updatedBuildings[buildingId].upgradeLevel}.`);
  safeDispatchGameEvent(`Здание ${buildingId} улучшено!`, 'success');
  
  // Если это действие связано с рефералом, обновляем его статус активации
  if (state.referrals && state.referrals.length > 0) {
    try {
      const userId = state.userId || '';
      if (userId) {
        // Вместо RPC используем прямое обновление через API
        import('@/api/referralService').then(module => {
          if (typeof module.updateReferralActivation === 'function') {
            module.updateReferralActivation(userId, true);
          }
        });
        
        console.log('Обновление статуса активации реферала запущено для:', userId);
        
        // Для выполнения SQL используем обходной метод
        const sqlQuery = `
          UPDATE referral_data
          SET is_activated = true
          WHERE user_id = '${userId}'
        `;
        
        import('@/api/referralService').then(module => {
          if (typeof module.executeCustomSql === 'function') {
            module.executeCustomSql(sqlQuery);
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса активации реферала:', error);
    }
  }
  
  return {
    ...state,
    resources: updatedResources,
    buildings: updatedBuildings
  };
};

// Функция для изменения статуса помощника
const processChangeHelperStatus = (
  state: GameState,
  payload: { helperId: string; status: string }
): GameState => {
  const { helperId, status } = payload;
  
  // Находим помощника в массиве
  const helperIndex = state.referralHelpers.findIndex(h => h.helperId === helperId);
  
  if (helperIndex === -1) {
    console.warn(`Помощник с ID ${helperId} не найден.`);
    return state;
  }
  
  // Обновляем статус помощника
  const updatedHelpers = [...state.referralHelpers];
  updatedHelpers[helperIndex] = {
    ...updatedHelpers[helperIndex],
    status: status
  };
  
  console.log(`Статус помощника ${helperId} изменен на ${status}.`);
  safeDispatchGameEvent(`Статус помощника изменен на ${status}!`, 'success');
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

// Функция для добавления нового помощника
const processAddHelper = (
  state: GameState,
  payload: { helper: any }
): GameState => {
  const { helper } = payload;
  
  // Проверяем, что все необходимые данные присутствуют
  if (!helper.helperId || !helper.employerId || !helper.buildingId) {
    console.warn('Недостаточно данных для добавления помощника.');
    return state;
  }
  
  // Добавляем нового помощника в массив
  const updatedHelpers = [...state.referralHelpers, helper];
  
  console.log(`Добавлен новый помощник с ID ${helper.helperId}.`);
  safeDispatchGameEvent(`Добавлен новый помощник!`, 'success');
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

// Функция для удаления помощника
const processRemoveHelper = (
  state: GameState,
  payload: { helperId: string }
): GameState => {
  const { helperId } = payload;
  
  // Фильтруем массив, чтобы удалить помощника с указанным ID
  const updatedHelpers = state.referralHelpers.filter(h => h.helperId !== helperId);
  
  console.log(`Удален помощник с ID ${helperId}.`);
  safeDispatchGameEvent(`Помощник удален!`, 'success');
  
  return {
    ...state,
    referralHelpers: updatedHelpers
  };
};

// Reducer для обработки действий, связанных со зданиями
export const buildingReducer = (
  state: GameState,
  action: { type: string; payload?: any }
): GameState => {
  switch (action.type) {
    case 'UNLOCK_BUILDING':
      return processUnlockBuilding(state, action.payload);
    case 'BUY_BUILDING':
      return processBuyBuilding(state, action.payload);
    case 'UPGRADE_BUILDING':
      return processUpgradeBuilding(state, action.payload);
    case 'CHANGE_HELPER_STATUS':
      return processChangeHelperStatus(state, action.payload);
    case 'ADD_HELPER':
      return processAddHelper(state, action.payload);
    case 'REMOVE_HELPER':
      return processRemoveHelper(state, action.payload);
    default:
      return state;
  }
};
