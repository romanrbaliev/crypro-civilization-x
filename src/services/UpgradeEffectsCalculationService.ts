
import { GameState, Upgrade } from '@/context/types';
import { ResourceEffectsService } from './ResourceEffectsService';
import { ResourceModifiersService } from './ResourceModifiersService';
import { EffectType } from '@/types/resources';

/**
 * Сервис для расчета эффектов улучшений
 */
export class UpgradeEffectsCalculationService {
  private static effectsService = new ResourceEffectsService();
  private static modifiersService = new ResourceModifiersService();
  
  /**
   * Рассчитывает общий эффект всех улучшений на производство
   * @param state Игровое состояние
   * @returns Объект с множителями для каждого ресурса
   */
  static calculateUpgradeProductionModifiers(state: GameState): Record<string, number> {
    const effects = this.effectsService.getAllActiveEffects(state);
    const modifiers = this.modifiersService.calculateProductionModifiers(state, effects);
    
    // Конвертируем формат модификаторов в старый формат для обратной совместимости
    const result: Record<string, number> = {};
    
    for (const resourceId in modifiers) {
      result[resourceId] = modifiers[resourceId].percent;
    }
    
    return result;
  }
  
  /**
   * Рассчитывает общий эффект всех улучшений на потребление
   * @param state Игровое состояние
   * @returns Объект с множителями для каждого ресурса
   */
  static calculateUpgradeConsumptionModifiers(state: GameState): Record<string, number> {
    const effects = this.effectsService.getAllActiveEffects(state);
    const modifiers = this.modifiersService.calculateConsumptionModifiers(state, effects);
    
    // Конвертируем формат модификаторов в старый формат для обратной совместимости
    const result: Record<string, number> = {};
    
    for (const resourceId in modifiers) {
      result[resourceId] = modifiers[resourceId].percent;
    }
    
    return result;
  }
}
