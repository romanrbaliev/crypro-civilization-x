
// Базовые функции для расчета ресурсов
import { GameState } from "@/context/types";
import { ResourceSystem } from "@/systems/ResourceSystem";

// Создаем экземпляр системы ресурсов
const resourceSystem = new ResourceSystem();

/**
 * Вычисляет общую скорость производства для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Скорость производства в единицах/сек
 */
export const calculateResourceProductionRate = (resourceId: string, state: GameState): number => {
  // Пересчитываем производство ресурсов
  const updatedState = resourceSystem.recalculateAllResourceProduction(state);
  
  // Возвращаем скорость производства для указанного ресурса
  return updatedState.resources[resourceId]?.production || 0;
};

/**
 * Вычисляет общую скорость потребления для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Скорость потребления в единицах/сек
 */
export const calculateResourceConsumptionRate = (resourceId: string, state: GameState): number => {
  // Пересчитываем производство ресурсов
  const updatedState = resourceSystem.recalculateAllResourceProduction(state);
  
  // Возвращаем скорость потребления для указанного ресурса
  return updatedState.resources[resourceId]?.consumption || 0;
};

/**
 * Вычисляет максимальную вместимость для заданного ресурса
 * @param resourceId ID ресурса
 * @param state Игровое состояние
 * @returns Максимальная вместимость
 */
export const calculateResourceMaxCapacity = (resourceId: string, state: GameState): number => {
  // Обновляем максимальные значения ресурсов
  const updatedState = resourceSystem.updateResourceMaxValues(state);
  
  // Возвращаем максимальное значение для указанного ресурса
  return updatedState.resources[resourceId]?.max || 0;
};
