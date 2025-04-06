
import { GameState } from '@/context/types';
import { EffectSource, EffectType, ResourceEffect } from '@/types/resources';

/**
 * Сервис для управления эффектами ресурсов
 */
export class ResourceEffectsService {
  /**
   * Собирает все активные эффекты из игрового состояния
   * @param state Игровое состояние
   * @returns Массив всех активных эффектов
   */
  getAllActiveEffects(state: GameState): ResourceEffect[] {
    const effects: ResourceEffect[] = [];
    
    // Собираем эффекты от зданий
    this.collectBuildingEffects(state, effects);
    
    // Собираем эффекты от улучшений/исследований
    this.collectUpgradeEffects(state, effects);
    
    // Собираем эффекты от специализаций
    if (state.specializations) {
      this.collectSpecializationEffects(state, effects);
    }
    
    // Собираем эффекты от синергий
    if (state.synergies) {
      this.collectSynergyEffects(state, effects);
    }
    
    // Собираем эффекты от рефералов и помощников
    if (state.referralHelpers && state.referralHelpers.length > 0) {
      this.collectReferralEffects(state, effects);
    }
    
    return effects;
  }
  
  /**
   * Собирает эффекты от зданий
   */
  private collectBuildingEffects(state: GameState, effects: ResourceEffect[]): void {
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (!building.unlocked || building.count <= 0) continue;
      
      // Эффекты производства
      if (building.production) {
        for (const resourceId in building.production) {
          const productionValue = building.production[resourceId] * building.count;
          if (productionValue > 0) {
            effects.push({
              id: `building_${buildingId}_produce_${resourceId}`,
              type: EffectType.PRODUCTION_FLAT,
              source: EffectSource.BUILDING,
              sourceId: buildingId,
              targetResourceId: resourceId,
              value: productionValue
            });
          }
        }
      }
      
      // Эффекты потребления
      if (building.consumption) {
        for (const resourceId in building.consumption) {
          const consumptionValue = building.consumption[resourceId] * building.count;
          if (consumptionValue > 0) {
            effects.push({
              id: `building_${buildingId}_consume_${resourceId}`,
              type: EffectType.CONSUMPTION_FLAT,
              source: EffectSource.BUILDING,
              sourceId: buildingId,
              targetResourceId: resourceId,
              value: consumptionValue
            });
          }
        }
      }
      
      // Другие эффекты здания
      if (building.effects) {
        this.parseAndAddBuildingEffects(building.id, building.effects, building.count, effects);
      }
    }
  }
  
  /**
   * Парсит и добавляет эффекты зданий
   */
  private parseAndAddBuildingEffects(
    buildingId: string, 
    buildingEffects: Record<string, number | string>, 
    count: number, 
    effects: ResourceEffect[]
  ): void {
    for (const effectKey in buildingEffects) {
      let effectValue: number = 0;
      if (typeof buildingEffects[effectKey] === 'number') {
        effectValue = Number(buildingEffects[effectKey]) * count;
      } else if (typeof buildingEffects[effectKey] === 'string') {
        effectValue = Number(buildingEffects[effectKey]) * count;
      }
      
      if (effectValue <= 0) continue;
      
      // Максимум ресурсов
      if (effectKey.includes('MaxBoost') || effectKey.includes('maxBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `building_${buildingId}_max_${resourceId}`,
            type: EffectType.MAX_CAPACITY_FLAT,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            targetResourceId: resourceId,
            value: effectValue
          });
        }
      }
      
      // Процентные бонусы к максимуму
      if (effectKey.includes('MaxPercentBoost') || effectKey.includes('maxPercentBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `building_${buildingId}_max_percent_${resourceId}`,
            type: EffectType.MAX_CAPACITY_PERCENT,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            targetResourceId: resourceId,
            value: effectValue
          });
        }
      }
      
      // Бонусы к производству
      if (effectKey.includes('ProductionBoost') || effectKey.includes('productionBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `building_${buildingId}_production_${resourceId}`,
            type: EffectType.PRODUCTION_PERCENT,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            targetResourceId: resourceId,
            value: effectValue
          });
        }
      }
      
      // Снижение потребления
      if (effectKey.includes('ConsumptionReduction') || effectKey.includes('consumptionReduction')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `building_${buildingId}_consumption_${resourceId}`,
            type: EffectType.CONSUMPTION_PERCENT,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            targetResourceId: resourceId,
            value: -effectValue // Отрицательное значение, так как это снижение
          });
        } else {
          // Глобальное снижение потребления
          effects.push({
            id: `building_${buildingId}_consumption_global`,
            type: EffectType.GLOBAL_CONSUMPTION_PERCENT,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            value: -effectValue // Отрицательное значение, так как это снижение
          });
        }
      }
      
      // Эффективность обмена/конвертации
      if (effectKey.includes('ExchangeEfficiencyBoost') || effectKey.includes('exchangeEfficiencyBoost')) {
        const resourcePair = this.extractResourceExchangePair(effectKey);
        if (resourcePair) {
          effects.push({
            id: `building_${buildingId}_exchange_${resourcePair}`,
            type: EffectType.CONVERSION_EFFICIENCY,
            source: EffectSource.BUILDING,
            sourceId: buildingId,
            targetResourceId: resourcePair,
            value: effectValue
          });
        }
      }
    }
  }
  
  /**
   * Собирает эффекты от улучшений
   */
  private collectUpgradeEffects(state: GameState, effects: ResourceEffect[]): void {
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.purchased) continue;
      
      // Применяем эффекты улучшения
      if (upgrade.effects) {
        this.parseAndAddUpgradeEffects(upgrade.id, upgrade.effects, effects);
      }
    }
  }
  
  /**
   * Парсит и добавляет эффекты улучшений
   */
  private parseAndAddUpgradeEffects(
    upgradeId: string, 
    upgradeEffects: Record<string, any>, 
    effects: ResourceEffect[]
  ): void {
    for (const effectKey in upgradeEffects) {
      const effectValue = Number(upgradeEffects[effectKey]);
      
      if (effectValue <= 0) continue;
      
      // Максимум ресурсов
      if (effectKey.includes('MaxBoost') || effectKey.includes('maxBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `upgrade_${upgradeId}_max_${resourceId}`,
            type: EffectType.MAX_CAPACITY_FLAT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            targetResourceId: resourceId,
            value: effectValue
          });
        }
      }
      
      // Процентные бонусы к максимуму
      if (effectKey.includes('MaxPercentBoost') || effectKey.includes('maxPercentBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `upgrade_${upgradeId}_max_percent_${resourceId}`,
            type: EffectType.MAX_CAPACITY_PERCENT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            targetResourceId: resourceId,
            value: effectValue
          });
        }
      }
      
      // Бонусы к производству
      if (effectKey.includes('ProductionBoost') || effectKey.includes('productionBoost')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `upgrade_${upgradeId}_production_${resourceId}`,
            type: EffectType.PRODUCTION_PERCENT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            targetResourceId: resourceId,
            value: effectValue
          });
        } else {
          // Глобальное повышение производства
          effects.push({
            id: `upgrade_${upgradeId}_production_global`,
            type: EffectType.GLOBAL_PRODUCTION_PERCENT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            value: effectValue
          });
        }
      }
      
      // Снижение потребления
      if (effectKey.includes('ConsumptionReduction') || effectKey.includes('consumptionReduction')) {
        const resourceId = this.extractResourceId(effectKey);
        if (resourceId) {
          effects.push({
            id: `upgrade_${upgradeId}_consumption_${resourceId}`,
            type: EffectType.CONSUMPTION_PERCENT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            targetResourceId: resourceId,
            value: -effectValue // Отрицательное значение, так как это снижение
          });
        } else {
          // Глобальное снижение потребления
          effects.push({
            id: `upgrade_${upgradeId}_consumption_global`,
            type: EffectType.GLOBAL_CONSUMPTION_PERCENT,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            value: -effectValue // Отрицательное значение, так как это снижение
          });
        }
      }
      
      // Эффективность обмена/конвертации
      if (effectKey.includes('EfficiencyBoost') || effectKey.includes('efficiencyBoost')) {
        // Например, knowledgeToUSDTEfficiencyBoost указывает на обмен knowledge -> USDT
        const resourcePair = this.extractResourceConversionPair(effectKey);
        if (resourcePair) {
          effects.push({
            id: `upgrade_${upgradeId}_efficiency_${resourcePair}`,
            type: EffectType.CONVERSION_EFFICIENCY,
            source: EffectSource.UPGRADE,
            sourceId: upgradeId,
            targetResourceId: resourcePair,
            value: effectValue
          });
        }
      }
    }
  }
  
  /**
   * Собирает эффекты от специализаций
   */
  private collectSpecializationEffects(state: GameState, effects: ResourceEffect[]): void {
    if (!state.specializations) return;
    
    for (const specId in state.specializations) {
      const spec = state.specializations[specId];
      
      // Пропускаем неактивные специализации
      if (!spec.selected || spec.level <= 0) continue;
      
      // Применяем бонусы специализации
      if (spec.bonuses) {
        for (const bonusKey in spec.bonuses) {
          const bonusValue = Number(spec.bonuses[bonusKey]) * spec.level;
          
          if (bonusValue <= 0) continue;
          
          // Добавляем соответствующие эффекты
          if (bonusKey.includes('EfficiencyBoost')) {
            // Эффективность майнинга и т.д.
            effects.push({
              id: `spec_${specId}_${bonusKey}`,
              type: EffectType.PRODUCTION_PERCENT,
              source: EffectSource.SPECIALIZATION,
              sourceId: specId,
              value: bonusValue
            });
          } else if (bonusKey.includes('ConsumptionReduction')) {
            // Снижение потребления
            const resourceId = this.extractResourceId(bonusKey);
            effects.push({
              id: `spec_${specId}_consumption_${resourceId || 'global'}`,
              type: resourceId 
                ? EffectType.CONSUMPTION_PERCENT 
                : EffectType.GLOBAL_CONSUMPTION_PERCENT,
              source: EffectSource.SPECIALIZATION,
              sourceId: specId,
              targetResourceId: resourceId,
              value: -bonusValue // Отрицательное значение, так как это снижение
            });
          }
        }
      }
    }
  }
  
  /**
   * Собирает эффекты от синергий специализаций
   */
  private collectSynergyEffects(state: GameState, effects: ResourceEffect[]): void {
    if (!state.synergies) return;
    
    for (const synergyId in state.synergies) {
      const synergy = state.synergies[synergyId];
      
      // Пропускаем неактивные синергии
      if (!synergy.active) continue;
      
      // Добавляем бонусы от синергии
      if (synergy.bonus) {
        for (const bonusKey in synergy.bonus) {
          // Пропускаем булевы флаги
          if (typeof synergy.bonus[bonusKey] === 'boolean') continue;
          
          const bonusValue = Number(synergy.bonus[bonusKey]);
          
          if (bonusValue <= 0) continue;
          
          // Бонусы к эффективности
          if (bonusKey.includes('EfficiencyBoost')) {
            effects.push({
              id: `synergy_${synergyId}_${bonusKey}`,
              type: EffectType.PRODUCTION_PERCENT,
              source: EffectSource.SYNERGY,
              sourceId: synergyId,
              value: bonusValue
            });
          }
        }
      }
    }
  }
  
  /**
   * Собирает эффекты от рефералов и помощников
   */
  private collectReferralEffects(state: GameState, effects: ResourceEffect[]): void {
    if (!state.referralHelpers || state.referralHelpers.length === 0) return;
    
    // Обрабатываем каждого помощника
    for (const helper of state.referralHelpers) {
      // Пропускаем неактивных помощников
      if (helper.status !== 'active' || !helper.buildingId) continue;
      
      const buildingId = helper.buildingId;
      const productivity = helper.productivity || 1;
      
      // Добавляем бонус к зданию, к которому прикреплен помощник
      effects.push({
        id: `helper_${helper.id}_building_${buildingId}`,
        type: EffectType.PRODUCTION_PERCENT,
        source: EffectSource.HELPER,
        sourceId: helper.id,
        value: productivity * 0.05 // Базовый бонус 5% за каждую единицу продуктивности
      });
    }
  }
  
  /**
   * Извлекает ID ресурса из ключа эффекта
   */
  private extractResourceId(effectKey: string): string | null {
    // Конвертируем стили именования
    const normalizedKey = effectKey.toLowerCase();
    
    // Определяем ресурсы по ключевым словам
    if (normalizedKey.includes('knowledge')) return 'knowledge';
    if (normalizedKey.includes('usdt')) return 'usdt';
    if (normalizedKey.includes('electricity')) return 'electricity';
    if (normalizedKey.includes('computing') || normalizedKey.includes('computingpower')) return 'computingPower';
    if (normalizedKey.includes('bitcoin') || normalizedKey.includes('btc')) return 'bitcoin';
    
    return null;
  }
  
  /**
   * Извлекает пару ресурсов для обмена из ключа эффекта
   */
  private extractResourceExchangePair(effectKey: string): string | null {
    if (effectKey.includes('btcExchange') || effectKey.includes('bitcoinExchange')) {
      return 'bitcoin-usdt';
    }
    
    return null;
  }
  
  /**
   * Извлекает пару ресурсов для конвертации из ключа эффекта
   */
  private extractResourceConversionPair(effectKey: string): string | null {
    const normalizedKey = effectKey.toLowerCase();
    
    if (normalizedKey.includes('knowledgetousdt')) {
      return 'knowledge-usdt';
    }
    
    return null;
  }
}
