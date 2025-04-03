
// Утилиты для работы с ресурсами
import { GameState, Resource, Building, Upgrade } from '../types';

/**
 * Проверяет, достаточно ли у игрока ресурсов для покупки
 */
export const hasEnoughResources = (
  state: GameState,
  costs: { [key: string]: number }
): boolean => {
  for (const [resourceId, amount] of Object.entries(costs)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < amount) {
      return false;
    }
  }
  return true;
};

/**
 * Проверяет разблокировки ресурсов, зданий и улучшений
 */
export const checkUnlocks = (state: GameState): GameState => {
  // Используем внешнюю функцию проверки разблокировок из utils/unlockManager
  const { checkAllUnlocks } = require('../../utils/unlockManager');
  return checkAllUnlocks(state);
};

/**
 * Расчет стоимости здания с учетом количества уже построенных
 */
export const calculateBuildingCost = (
  building: Building
): { [key: string]: number } => {
  const costs: { [key: string]: number } = {};
  
  // Проверяем наличие cost в здании
  if (!building.cost) {
    console.warn(`Здание ${building.id} не имеет определенной стоимости`);
    return costs;
  }
  
  // Применяем множитель стоимости на основе количества уже построенных зданий
  const multiplier = building.count > 0 
    ? Math.pow(building.costMultiplier || 1.1, building.count) 
    : 1;
  
  // Рассчитываем стоимость каждого ресурса
  for (const [resourceId, baseAmount] of Object.entries(building.cost)) {
    costs[resourceId] = Math.ceil(baseAmount * multiplier);
  }
  
  return costs;
};

/**
 * Форматирование числа для отображения
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(2);
  }
};

/**
 * Рассчитывает производство ресурсов с учетом бонусов
 */
export const calculateTotalProduction = (
  state: GameState,
  resourceId: string
): number => {
  // Базовое производство ресурса
  let production = state.resources[resourceId]?.baseProduction || 0;
  
  // Добавляем производство от зданий
  for (const building of Object.values(state.buildings)) {
    if (!building.unlocked || building.count === 0) continue;
    
    const buildingProduction = building.production[resourceId] || 0;
    production += buildingProduction * building.count;
  }
  
  // Применяем бонусы от улучшений
  for (const upgrade of Object.values(state.upgrades)) {
    if (!upgrade.purchased) continue;
    
    const productionBonus = upgrade.effects[`${resourceId}ProductionBonus`] || 0;
    const productionMultiplier = upgrade.effects[`${resourceId}ProductionMultiplier`] || 0;
    
    production += productionBonus;
    if (productionMultiplier > 0) {
      production *= (1 + productionMultiplier);
    }
  }
  
  return production;
};
