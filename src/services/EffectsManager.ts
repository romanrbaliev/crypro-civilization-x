
import { GameState, Resource } from '@/context/types';

export class EffectsManager {
  /**
   * Применяет эффекты к игровому состоянию
   */
  static applyEffects(state: GameState, effects: Record<string, any>): GameState {
    if (!effects || Object.keys(effects).length === 0) {
      return state;
    }

    // Создаем копию состояния для модификации
    const newState = { ...state };
    
    // Обработка эффектов для ресурсов
    for (const [effectType, effectValue] of Object.entries(effects)) {
      // Эффекты для максимального количества ресурса
      if (effectType.startsWith('max') && effectType.endsWith('Boost')) {
        const resourceId = effectType.replace('max', '').replace('Boost', '').toLowerCase();
        this.applyMaxResourceBoost(newState, resourceId, Number(effectValue));
      }
      
      // Эффекты для процентного увеличения максимального количества ресурса
      else if (effectType.endsWith('PercentBoost')) {
        const resourceId = effectType.replace('PercentBoost', '').toLowerCase();
        this.applyPercentBoost(newState, resourceId, Number(effectValue));
      }
      
      // Эффекты для увеличения производства
      else if (effectType.endsWith('ProductionBoost')) {
        const resourceId = effectType.replace('ProductionBoost', '').toLowerCase();
        this.applyProductionBoost(newState, resourceId, Number(effectValue));
      }
      
      // Эффекты для снижения потребления
      else if (effectType.endsWith('ConsumptionReduction')) {
        const resourceId = effectType.replace('ConsumptionReduction', '').toLowerCase();
        this.applyConsumptionReduction(newState, resourceId, Number(effectValue));
      }
      
      // Майнинг и обмен
      else if (effectType === 'miningEfficiencyBoost') {
        newState.miningParams.miningEfficiency = 
          (newState.miningParams.miningEfficiency || 1) * (1 + Number(effectValue));
      }
      else if (effectType === 'energyEfficiencyBoost') {
        newState.miningParams.energyEfficiency = 
          (newState.miningParams.energyEfficiency || 1) * (1 + Number(effectValue));
      }
      
      // Разблокировка возможностей
      else if (effectType === 'tradingUnlocked' && effectValue) {
        if (!newState.unlocks) newState.unlocks = {};
        newState.unlocks.trading = true;
      }
      else if (effectType === 'autoBotTrading' && effectValue) {
        if (!newState.unlocks) newState.unlocks = {};
        newState.unlocks.autoSell = true;
      }
    }

    return newState;
  }

  /**
   * Применяет абсолютное увеличение максимального значения ресурса
   */
  private static applyMaxResourceBoost(state: GameState, resourceId: string, value: number) {
    const resource = state.resources[resourceId];
    if (!resource) return;

    state.resources[resourceId] = {
      ...resource,
      max: resource.max + value
    };
  }

  /**
   * Применяет процентное увеличение максимального значения ресурса
   */
  private static applyPercentBoost(state: GameState, resourceId: string, percentage: number) {
    const resource = state.resources[resourceId];
    if (!resource) return;

    const boost = resource.max * percentage;
    state.resources[resourceId] = {
      ...resource,
      max: resource.max + boost
    };
  }

  /**
   * Применяет увеличение производства ресурса
   */
  private static applyProductionBoost(state: GameState, resourceId: string, percentage: number) {
    const resource = state.resources[resourceId];
    if (!resource) return;

    // Увеличение будет применено при следующем расчете производства
    // Эффекты сохраняются, а производство рассчитывается позже
    if (!state.effects) state.effects = {};
    state.effects[`${resourceId}ProductionBoost`] = 
      (state.effects[`${resourceId}ProductionBoost`] || 0) + percentage;
  }

  /**
   * Применяет снижение потребления ресурса
   */
  private static applyConsumptionReduction(state: GameState, resourceId: string, percentage: number) {
    // Эффекты сохраняются, а потребление рассчитывается позже
    if (!state.effects) state.effects = {};
    state.effects[`${resourceId}ConsumptionReduction`] = 
      (state.effects[`${resourceId}ConsumptionReduction`] || 0) + percentage;
  }

  /**
   * Собирает все текущие эффекты состояния игры
   */
  static calculateTotalEffects(state: GameState): Record<string, number> {
    const totalEffects: Record<string, number> = {};
    
    // Эффекты от зданий
    for (const building of Object.values(state.buildings)) {
      if (building.count > 0 && building.effects) {
        for (const [effectType, effectValue] of Object.entries(building.effects)) {
          if (typeof effectValue === 'number') {
            totalEffects[effectType] = (totalEffects[effectType] || 0) + 
                                      effectValue * building.count;
          }
        }
      }
    }
    
    // Эффекты от исследований
    for (const upgrade of Object.values(state.upgrades)) {
      if (upgrade.purchased && upgrade.effects) {
        for (const [effectType, effectValue] of Object.entries(upgrade.effects)) {
          if (typeof effectValue === 'number') {
            totalEffects[effectType] = (totalEffects[effectType] || 0) + 
                                      Number(effectValue);
          }
        }
      }
    }
    
    // Эффекты от специализаций
    if (state.player?.specialization && state.specializations) {
      const specialization = state.specializations[state.player.specialization];
      if (specialization?.bonuses) {
        for (const [effectType, effectValue] of Object.entries(specialization.bonuses)) {
          if (typeof effectValue === 'number') {
            totalEffects[effectType] = (totalEffects[effectType] || 0) + 
                                      Number(effectValue);
          }
        }
      }
    }
    
    return totalEffects;
  }
}
