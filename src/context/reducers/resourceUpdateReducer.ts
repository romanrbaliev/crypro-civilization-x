
import { GameState } from '../types';
import { updateResourceMaxValues, calculateProductionBoost } from '../utils/resourceUtils';
import { calculateBuildingBoostFromHelpers, calculateHelperBoost } from '@/utils/helpers';

// Обновление ресурсов с учетом времени, прошедшего с последнего обновления
export const processResourceUpdate = (state: GameState): GameState => {
  const now = Date.now();
  const deltaTime = (now - state.lastUpdate) / 1000; // Время в секундах
  
  if (deltaTime <= 0) return state;
  
  const newResources = { ...state.resources };
  const newBuildings = { ...state.buildings };

  // Проверяем компьютеры на наличие электричества
  const electricityPerComputer = 0.5;
  const totalComputers = state.buildings.homeComputer?.count || 0;
  const electricityNeeded = totalComputers * electricityPerComputer;
  const availableElectricity = state.resources.electricity?.value || 0;

  // Если электричества недостаточно, выключаем компьютеры
  if (totalComputers > 0 && availableElectricity < electricityNeeded) {
    if (newBuildings.homeComputer.count > 0) {
      console.log(`Электричества недостаточно (${availableElectricity}/${electricityNeeded}). Компьютеры отключены.`);
      newBuildings.homeComputer = {
        ...newBuildings.homeComputer,
        production: { 
          ...newBuildings.homeComputer.production,
          computingPower: 0 
        }
      };
    }
  } else if (totalComputers > 0) {
    // Электричества достаточно, восстанавливаем производство
    if (
      newBuildings.homeComputer.count > 0 && 
      newBuildings.homeComputer.production.computingPower === 0
    ) {
      console.log("Электричества достаточно. Компьютеры работают.");
      newBuildings.homeComputer = {
        ...newBuildings.homeComputer,
        production: { 
          ...newBuildings.homeComputer.production,
          computingPower: 2 
        }
      };
    }
    
    // Вычитаем потребляемое электричество
    if (newResources.electricity) {
      newResources.electricity = {
        ...newResources.electricity,
        value: Math.max(0, newResources.electricity.value - (electricityNeeded * deltaTime))
      };
    }
  }

  // Обновляем значения ресурсов с учетом производства и максимумов
  for (const resourceId in newResources) {
    const resource = newResources[resourceId];
    
    // Учёт ресурсов, производимых зданиями
    const boost = calculateProductionBoost(state, resourceId);
    let perSecond = 0;
    
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.count > 0 && building.production[resourceId]) {
        // Рассчитываем базовую производительность
        let buildingProduction = building.production[resourceId] * building.count;
        
        // Добавляем бонусы от помощников для этого здания
        const helperBoost = calculateBuildingBoostFromHelpers(buildingId, state.referralHelpers);
        if (helperBoost > 0) {
          buildingProduction *= (1 + helperBoost);
        }
        
        perSecond += buildingProduction;
      }
    }
    
    // Применяем бонусы от участия в роли помощника
    if (state.referrals.length > 0) {
      const userId = state.referralCode; // Используем реферальный код как ID
      const helperBoost = calculateHelperBoost(userId, state.referralHelpers);
      if (helperBoost > 0) {
        perSecond *= (1 + helperBoost);
      }
    }
    
    // Применяем общие бонусы от улучшений
    perSecond *= boost;
    
    // Рассчитываем новое значение ресурса
    let newValue = resource.value + (perSecond * deltaTime);
    
    // Проверяем, не превышает ли новое значение максимума
    if (resource.max !== Infinity && newValue > resource.max) {
      newValue = resource.max;
    }
    
    // Обновляем ресурс
    newResources[resourceId] = {
      ...resource,
      value: newValue,
      perSecond: perSecond
    };
  }
  
  // Обновляем состояние
  const newState = {
    ...state,
    resources: newResources,
    buildings: newBuildings,
    lastUpdate: now,
    gameTime: state.gameTime + deltaTime
  };
  
  // Обновляем максимальные значения ресурсов
  return updateResourceMaxValues(newState);
};
