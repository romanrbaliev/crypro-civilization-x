
import { GameState } from '@/context/types';
import { EffectType, ResourceEffect, ResourceModifier } from '@/types/resources';

/**
 * Сервис для управления модификаторами ресурсов
 */
export class ResourceModifiersService {
  /**
   * Рассчитывает модификаторы производства для всех ресурсов
   * @param state Игровое состояние
   * @param effects Массив активных эффектов
   * @returns Объект с модификаторами производства для каждого ресурса
   */
  calculateProductionModifiers(
    state: GameState, 
    effects: ResourceEffect[]
  ): Record<string, ResourceModifier> {
    const modifiers: Record<string, ResourceModifier> = {};
    
    // Инициализируем модификаторы для всех разблокированных ресурсов
    for (const resourceId in state.resources) {
      if (state.resources[resourceId].unlocked) {
        modifiers[resourceId] = {
          resourceId,
          flat: 0,
          percent: 1 // Начальный множитель = 100%
        };
      }
    }
    
    // Глобальный модификатор производства
    let globalProductionPercent = 1;
    
    // Применяем эффекты к модификаторам
    for (const effect of effects) {
      // Обрабатываем только эффекты, связанные с производством
      switch (effect.type) {
        case EffectType.PRODUCTION_FLAT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            modifiers[effect.targetResourceId].flat += effect.value;
          }
          break;
          
        case EffectType.PRODUCTION_PERCENT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            modifiers[effect.targetResourceId].percent += effect.value;
          }
          break;
          
        case EffectType.GLOBAL_PRODUCTION_PERCENT:
          globalProductionPercent += effect.value;
          break;
      }
    }
    
    // Применяем глобальный модификатор ко всем ресурсам
    if (globalProductionPercent !== 1) {
      for (const resourceId in modifiers) {
        modifiers[resourceId].percent *= globalProductionPercent;
      }
    }
    
    return modifiers;
  }
  
  /**
   * Рассчитывает модификаторы потребления для всех ресурсов
   * @param state Игровое состояние
   * @param effects Массив активных эффектов
   * @returns Объект с модификаторами потребления для каждого ресурса
   */
  calculateConsumptionModifiers(
    state: GameState, 
    effects: ResourceEffect[]
  ): Record<string, ResourceModifier> {
    const modifiers: Record<string, ResourceModifier> = {};
    
    // Инициализируем модификаторы для всех разблокированных ресурсов
    for (const resourceId in state.resources) {
      if (state.resources[resourceId].unlocked) {
        modifiers[resourceId] = {
          resourceId,
          flat: 0,
          percent: 1 // Начальный множитель = 100%
        };
      }
    }
    
    // Глобальный модификатор потребления
    let globalConsumptionPercent = 1;
    
    // Применяем эффекты к модификаторам
    for (const effect of effects) {
      // Обрабатываем только эффекты, связанные с потреблением
      switch (effect.type) {
        case EffectType.CONSUMPTION_FLAT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            modifiers[effect.targetResourceId].flat += effect.value;
          }
          break;
          
        case EffectType.CONSUMPTION_PERCENT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            // Добавляем процентное изменение (может быть отрицательным для уменьшения потребления)
            modifiers[effect.targetResourceId].percent += effect.value;
          }
          break;
          
        case EffectType.GLOBAL_CONSUMPTION_PERCENT:
          globalConsumptionPercent += effect.value;
          break;
      }
    }
    
    // Применяем глобальный модификатор ко всем ресурсам
    if (globalConsumptionPercent !== 1) {
      for (const resourceId in modifiers) {
        modifiers[resourceId].percent *= globalConsumptionPercent;
      }
    }
    
    // Убеждаемся, что множитель потребления не стал отрицательным
    for (const resourceId in modifiers) {
      modifiers[resourceId].percent = Math.max(0, modifiers[resourceId].percent);
    }
    
    return modifiers;
  }
  
  /**
   * Рассчитывает модификаторы максимальных значений для всех ресурсов
   * @param state Игровое состояние
   * @param effects Массив активных эффектов
   * @returns Объект с модификаторами максимальных значений для каждого ресурса
   */
  calculateMaxCapacityModifiers(
    state: GameState, 
    effects: ResourceEffect[]
  ): Record<string, ResourceModifier> {
    const modifiers: Record<string, ResourceModifier> = {};
    
    // Инициализируем модификаторы для всех разблокированных ресурсов
    for (const resourceId in state.resources) {
      if (state.resources[resourceId].unlocked) {
        modifiers[resourceId] = {
          resourceId,
          flat: 0,
          percent: 1 // Начальный множитель = 100%
        };
      }
    }
    
    // Применяем эффекты к модификаторам
    for (const effect of effects) {
      // Обрабатываем только эффекты, связанные с максимальными значениями
      switch (effect.type) {
        case EffectType.MAX_CAPACITY_FLAT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            modifiers[effect.targetResourceId].flat += effect.value;
          }
          break;
          
        case EffectType.MAX_CAPACITY_PERCENT:
          if (effect.targetResourceId && modifiers[effect.targetResourceId]) {
            modifiers[effect.targetResourceId].percent += effect.value;
          }
          break;
      }
    }
    
    return modifiers;
  }
  
  /**
   * Рассчитывает модификаторы эффективности конвертации
   * @param state Игровое состояние
   * @param effects Массив активных эффектов
   * @returns Объект с модификаторами конвертации для каждой пары ресурсов
   */
  calculateConversionEfficiencyModifiers(
    state: GameState, 
    effects: ResourceEffect[]
  ): Record<string, number> {
    const modifiers: Record<string, number> = {};
    
    // Применяем эффекты к модификаторам
    for (const effect of effects) {
      // Обрабатываем только эффекты эффективности конвертации
      if (effect.type === EffectType.CONVERSION_EFFICIENCY && effect.targetResourceId) {
        const key = effect.targetResourceId;
        
        if (!modifiers[key]) {
          modifiers[key] = 1; // Базовый множитель 100%
        }
        
        modifiers[key] += effect.value;
      }
    }
    
    return modifiers;
  }
}
