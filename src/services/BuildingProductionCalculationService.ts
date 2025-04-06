
import { GameState, Building } from '@/context/types';
import { ResourceEffectsService } from './ResourceEffectsService';
import { ResourceModifiersService } from './ResourceModifiersService';

/**
 * Сервис для расчета производства зданий
 */
export class BuildingProductionCalculationService {
  private static effectsService = new ResourceEffectsService();
  private static modifiersService = new ResourceModifiersService();
  
  /**
   * Рассчитывает общее производство здания
   * @param building Здание
   * @param state Игровое состояние
   * @returns Объект с показателями производства по каждому ресурсу
   */
  static calculateBuildingProduction(building: Building, state: GameState): Record<string, number> {
    // Базовое производство здания
    const result: Record<string, number> = {};
    
    // Если здание не разблокировано или его количество равно 0, возвращаем пустой объект
    if (!building.unlocked || building.count <= 0) {
      return result;
    }
    
    // Получаем базовое производство здания
    if (building.production) {
      for (const resourceId in building.production) {
        result[resourceId] = building.production[resourceId] * building.count;
      }
    }
    
    // Получаем все активные эффекты
    const effects = this.effectsService.getAllActiveEffects(state);
    
    // Получаем модификаторы производства
    const productionModifiers = this.modifiersService.calculateProductionModifiers(state, effects);
    
    // Применяем модификаторы к производству
    for (const resourceId in result) {
      if (productionModifiers[resourceId]) {
        result[resourceId] *= productionModifiers[resourceId].percent;
      }
    }
    
    return result;
  }
  
  /**
   * Рассчитывает общее потребление здания
   * @param building Здание
   * @param state Игровое состояние
   * @returns Объект с показателями потребления по каждому ресурсу
   */
  static calculateBuildingConsumption(building: Building, state: GameState): Record<string, number> {
    // Базовое потребление здания
    const result: Record<string, number> = {};
    
    // Если здание не разблокировано или его количество равно 0, возвращаем пустой объект
    if (!building.unlocked || building.count <= 0) {
      return result;
    }
    
    // Получаем базовое потребление здания
    if (building.consumption) {
      for (const resourceId in building.consumption) {
        result[resourceId] = building.consumption[resourceId] * building.count;
      }
    }
    
    // Получаем все активные эффекты
    const effects = this.effectsService.getAllActiveEffects(state);
    
    // Получаем модификаторы потребления
    const consumptionModifiers = this.modifiersService.calculateConsumptionModifiers(state, effects);
    
    // Применяем модификаторы к потреблению
    for (const resourceId in result) {
      if (consumptionModifiers[resourceId]) {
        result[resourceId] *= consumptionModifiers[resourceId].percent;
      }
    }
    
    return result;
  }
}
