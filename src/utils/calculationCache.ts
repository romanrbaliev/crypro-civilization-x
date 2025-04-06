
import { GameState } from '@/context/types';

/**
 * Класс для кэширования сложных вычислений для повышения производительности
 */
export class CalculationCache {
  private static cache: Map<string, any> = new Map();
  private static lastUpdateTimestamp: number = 0;
  
  /**
   * Сбрасывает весь кэш
   */
  static clearCache(): void {
    this.cache.clear();
    this.lastUpdateTimestamp = Date.now();
  }
  
  /**
   * Сбрасывает кэш, если прошло слишком много времени
   */
  static validateCache(state: GameState): void {
    if (state.lastUpdate > this.lastUpdateTimestamp) {
      this.clearCache();
      this.lastUpdateTimestamp = state.lastUpdate;
    }
  }
  
  /**
   * Получает или вычисляет значение производства ресурса
   */
  static getResourceProduction(state: GameState, resourceId: string): number {
    this.validateCache(state);
    
    const cacheKey = `production_${resourceId}_${state.lastUpdate}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Здесь будет сложное вычисление производства ресурса
    // Пока используем простую логику
    let production = 0;
    
    // Базовое производство от зданий
    for (const building of Object.values(state.buildings)) {
      if (building.count > 0 && building.production && building.production[resourceId]) {
        production += building.production[resourceId] * building.count;
      }
    }
    
    // Применение модификаторов
    if (state.effects && state.effects[`${resourceId}ProductionBoost`]) {
      production *= (1 + state.effects[`${resourceId}ProductionBoost`]);
    }
    
    // Сохраняем в кэш и возвращаем
    this.cache.set(cacheKey, production);
    return production;
  }
  
  /**
   * Получает или вычисляет потребление ресурса
   */
  static getResourceConsumption(state: GameState, resourceId: string): number {
    this.validateCache(state);
    
    const cacheKey = `consumption_${resourceId}_${state.lastUpdate}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Вычисляем потребление ресурса
    let consumption = 0;
    
    // Потребление от зданий
    for (const building of Object.values(state.buildings)) {
      if (building.count > 0 && building.consumption && building.consumption[resourceId]) {
        consumption += building.consumption[resourceId] * building.count;
      }
    }
    
    // Применение модификаторов потребления
    if (state.effects && state.effects[`${resourceId}ConsumptionReduction`]) {
      consumption *= (1 - state.effects[`${resourceId}ConsumptionReduction`]);
    }
    
    // Сохраняем в кэш и возвращаем
    this.cache.set(cacheKey, consumption);
    return consumption;
  }
  
  /**
   * Получает чистое производство ресурса (производство - потребление)
   */
  static getNetProduction(state: GameState, resourceId: string): number {
    const production = this.getResourceProduction(state, resourceId);
    const consumption = this.getResourceConsumption(state, resourceId);
    return production - consumption;
  }
}
