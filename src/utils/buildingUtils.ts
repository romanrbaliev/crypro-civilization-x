
import { GameState } from '@/context/types';
import { Building } from '@/context/types';

/**
 * Проверяет, разблокировано ли здание
 * @param state Состояние игры
 * @param buildingId ID здания
 * @returns Разблокировано ли здание
 */
export const isUnlockedBuilding = (state: GameState, buildingId: string): boolean => {
  return state.buildings[buildingId]?.unlocked || false;
};

/**
 * Получает список зданий определенной категории
 * @param state Состояние игры
 * @param categories Список категорий или одна категория
 * @returns Массив зданий
 */
export const getCategoryBuildings = (state: GameState, categories: string[] | string): Building[] => {
  const categoryList = Array.isArray(categories) ? categories : [categories];
  
  return Object.values(state.buildings)
    .filter(building => building.unlocked && categoryList.includes(building.id))
    .sort((a, b) => {
      // Сортировка по порядку в массиве категорий
      const indexA = categoryList.indexOf(a.id);
      const indexB = categoryList.indexOf(b.id);
      return indexA - indexB;
    });
};
