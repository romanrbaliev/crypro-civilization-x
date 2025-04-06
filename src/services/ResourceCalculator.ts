
import { GameState, Resource } from '@/context/types';
import { ResourceMetrics } from '@/types/resources';
import { ResourceEffectsService } from './ResourceEffectsService';
import { ResourceModifiersService } from './ResourceModifiersService';

/**
 * Сервис для расчетов, связанных с ресурсами
 */
export class ResourceCalculator {
  private effectsService: ResourceEffectsService;
  private modifiersService: ResourceModifiersService;
  
  constructor() {
    this.effectsService = new ResourceEffectsService();
    this.modifiersService = new ResourceModifiersService();
  }
  
  /**
   * Рассчитывает метрики производства/потребления для всех ресурсов
   * @param state Игровое состояние
   * @returns Объект с метриками для каждого ресурса
   */
  calculateResourceMetrics(state: GameState): Record<string, ResourceMetrics> {
    // Получаем все активные эффекты
    const effects = this.effectsService.getAllActiveEffects(state);
    
    // Рассчитываем модификаторы
    const productionModifiers = this.modifiersService.calculateProductionModifiers(state, effects);
    const consumptionModifiers = this.modifiersService.calculateConsumptionModifiers(state, effects);
    
    const metrics: Record<string, ResourceMetrics> = {};
    
    // Рассчитываем метрики для каждого ресурса
    for (const resourceId in state.resources) {
      const resource = state.resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) continue;
      
      // Базовое производство
      const baseProduction = resource.baseProduction || 0;
      // Базовое потребление всегда 0, так как мы считаем его отдельно
      const baseConsumption = 0;
      
      // Получаем модификаторы для данного ресурса
      const prodMod = productionModifiers[resourceId] || { flat: 0, percent: 1 };
      const consMod = consumptionModifiers[resourceId] || { flat: 0, percent: 1 };
      
      // Рассчитываем итоговое производство
      const finalProduction = (baseProduction * prodMod.percent) + prodMod.flat;
      
      // Рассчитываем итоговое потребление
      const finalConsumption = (baseConsumption * consMod.percent) + consMod.flat;
      
      // Чистое производство = производство - потребление
      const netProduction = finalProduction - finalConsumption;
      
      // Создаем метрику для ресурса
      metrics[resourceId] = {
        baseProduction,
        baseConsumption,
        finalProduction,
        finalConsumption,
        netProduction,
        productionSources: this.getProductionSources(effects, resourceId),
        consumptionSources: this.getConsumptionSources(effects, resourceId)
      };
    }
    
    return metrics;
  }
  
  /**
   * Получает источники производства для указанного ресурса
   */
  private getProductionSources(effects: any[], resourceId: string) {
    return effects
      .filter(e => e.targetResourceId === resourceId && e.type === 'productionFlat' && e.value > 0)
      .map(e => ({
        sourceType: e.source,
        sourceId: e.sourceId,
        amount: e.value
      }));
  }
  
  /**
   * Получает источники потребления для указанного ресурса
   */
  private getConsumptionSources(effects: any[], resourceId: string) {
    return effects
      .filter(e => e.targetResourceId === resourceId && e.type === 'consumptionFlat' && e.value > 0)
      .map(e => ({
        sourceType: e.source,
        sourceId: e.sourceId,
        amount: e.value
      }));
  }
  
  /**
   * Рассчитывает максимальные значения для всех ресурсов
   * @param state Игровое состояние
   * @returns Объект с максимальными значениями для каждого ресурса
   */
  calculateResourceMaxValues(state: GameState): Record<string, number> {
    // Получаем все активные эффекты
    const effects = this.effectsService.getAllActiveEffects(state);
    
    // Рассчитываем модификаторы максимальных значений
    const maxCapacityModifiers = this.modifiersService.calculateMaxCapacityModifiers(state, effects);
    
    const maxValues: Record<string, number> = {};
    
    // Рассчитываем максимальные значения для каждого ресурса
    for (const resourceId in state.resources) {
      const resource = state.resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) continue;
      
      // Базовое максимальное значение ресурса
      let baseMax = 0;
      
      // Определяем базовый максимум в зависимости от типа ресурса
      switch (resourceId) {
        case 'knowledge':
          baseMax = 100;
          break;
        case 'usdt':
          baseMax = 100;
          break;
        case 'electricity':
          baseMax = 100;
          break;
        case 'computingPower':
          baseMax = 1000;
          break;
        case 'bitcoin':
          baseMax = 0.01;
          break;
        default:
          baseMax = 100;
      }
      
      // Получаем модификатор для данного ресурса
      const modifier = maxCapacityModifiers[resourceId] || { flat: 0, percent: 1 };
      
      // Рассчитываем итоговое максимальное значение
      const finalMax = (baseMax * modifier.percent) + modifier.flat;
      
      maxValues[resourceId] = Math.max(0, finalMax);
    }
    
    return maxValues;
  }
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   * @param state Игровое состояние
   * @param cost Стоимость в виде объекта {resourceId: amount, ...}
   * @returns true, если ресурсов достаточно
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      const requiredAmount = Number(cost[resourceId]);
      
      // Если ресурс не существует, не разблокирован или его недостаточно
      if (!resource || !resource.unlocked || resource.value < requiredAmount) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Получает список недостающих ресурсов
   * @param state Игровое состояние
   * @param cost Стоимость в виде объекта {resourceId: amount, ...}
   * @returns Объект с недостающими ресурсами {resourceId: missingAmount, ...}
   */
  getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};
    
    for (const resourceId in cost) {
      const resource = state.resources[resourceId];
      const requiredAmount = Number(cost[resourceId]);
      
      // Если ресурс не существует или не разблокирован
      if (!resource || !resource.unlocked) {
        missingResources[resourceId] = requiredAmount;
        continue;
      }
      
      // Если ресурса недостаточно
      if (resource.value < requiredAmount) {
        missingResources[resourceId] = requiredAmount - resource.value;
      }
    }
    
    return missingResources;
  }
  
  /**
   * Рассчитывает эффективность обмена между двумя ресурсами
   * @param state Игровое состояние
   * @param fromResourceId ID ресурса, который конвертируется
   * @param toResourceId ID ресурса, в который происходит конвертация
   * @returns Коэффициент эффективности обмена
   */
  calculateConversionEfficiency(
    state: GameState, 
    fromResourceId: string, 
    toResourceId: string
  ): number {
    // Получаем все активные эффекты
    const effects = this.effectsService.getAllActiveEffects(state);
    
    // Рассчитываем модификаторы эффективности конвертации
    const conversionModifiers = this.modifiersService.calculateConversionEfficiencyModifiers(state, effects);
    
    // Ключ для поиска модификатора
    const conversionKey = `${fromResourceId}-${toResourceId}`;
    
    // Получаем модификатор для данной пары ресурсов
    const efficiency = conversionModifiers[conversionKey] || 1;
    
    return efficiency;
  }
}
