
import { GameState, Resource, ResourceType } from '@/context/types';

// Сервис для обработки эффектов в игре
export class EffectService {
  // Метод для добавления эффектов от зданий
  addBuildingEffects(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Создаем bitcoin ресурс, если он еще не существует
    if (!resources.bitcoin) {
      resources.bitcoin = {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Bitcoin - первая и основная криптовалюта',
        type: 'currency' as ResourceType,
        icon: 'bitcoin',
        value: 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 0.01,
        unlocked: true,
        consumption: 0
      };
    }
    
    // Добавляем производство ресурсов от зданий
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      if (building.count > 0 && building.production) {
        for (const [resourceId, production] of Object.entries(building.production)) {
          if (resources[resourceId]) {
            const resourceProduction = resources[resourceId].production || 0;
            const newProduction = resourceProduction + (production as number) * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              production: newProduction,
              perSecond: newProduction,
            };
          }
        }
      }
    }
    
    // Добавляем эффекты от исследований
    for (const upgradeId in newState.upgrades) {
      const upgrade = newState.upgrades[upgradeId];
      
      if (upgrade.purchased && upgrade.effects) {
        // Обрабатываем эффекты улучшений для ресурсов
        for (const [effectType, effectValue] of Object.entries(upgrade.effects)) {
          this.applyUpgradeEffect(resources, effectType, effectValue);
        }
        
        // Специальная обработка для blockchainBasics (исправление производства знаний)
        if (upgradeId === 'blockchainBasics' && resources.knowledge) {
          // Увеличиваем максимальное значение знаний на 50%
          if (!upgrade.effects.knowledgeMaxBoost) {
            resources.knowledge.max = (resources.knowledge.max || 100) * 1.5;
          }
          
          // Увеличиваем производство знаний на 10%
          resources.knowledge.production = (resources.knowledge.production || 0) * 1.1;
          resources.knowledge.perSecond = (resources.knowledge.perSecond || 0) * 1.1;
          
          console.log(`[EffectService] Применен эффект blockchainBasics для knowledge: max=${resources.knowledge.max}, production=${resources.knowledge.production}`);
        }
      }
    }
    
    newState.resources = resources;
    return newState;
  }
  
  // Применение эффекта исследования
  private applyUpgradeEffect(
    resources: Record<string, Resource>,
    effectType: string,
    effectValue: any
  ): void {
    // Преобразуем effectType к нижнему регистру для консистентности
    const effectTypeLower = effectType.toLowerCase();
    
    // Проверяем тип эффекта по шаблонам
    if (effectTypeLower.includes('max') && effectTypeLower.includes('boost')) {
      // Эффект на максимальное значение ресурса
      this.applyMaxBoostEffect(resources, effectTypeLower, effectValue);
    } else if (effectTypeLower.includes('production') || 
              (effectTypeLower.includes('boost') && !effectTypeLower.includes('max'))) {
      // Эффект на производство ресурса
      this.applyProductionBoostEffect(resources, effectTypeLower, effectValue);
    } else if (effectTypeLower.includes('efficiency')) {
      // Эффект на эффективность (обработка в других сервисах)
      console.log(`[EffectService] Эффект эффективности ${effectType} будет обработан в других сервисах`);
    } else {
      // Неизвестный тип эффекта
      console.warn(`[EffectService] Неизвестный тип эффекта: ${effectType}`);
    }
  }
  
  // Применение эффекта на максимальное значение ресурса
  private applyMaxBoostEffect(
    resources: Record<string, Resource>,
    effectType: string,
    effectValue: any
  ): void {
    // Определяем ID ресурса из эффекта
    const resourceId = this.extractResourceIdFromEffect(effectType);
    
    if (!resourceId || !resources[resourceId]) {
      console.warn(`[EffectService] Ресурс не найден для эффекта ${effectType}`);
      return;
    }
    
    const resource = resources[resourceId];
    const numValue = Number(effectValue);
    
    // Если эффект процентный (>= 1.0)
    if (numValue >= 1.0) {
      resource.max = (resource.max || 0) * numValue;
    } else {
      // Если эффект предполагает добавление процента (< 1.0)
      resource.max = (resource.max || 0) * (1 + numValue);
    }
    
    console.log(`[EffectService] Применен maxBoost для ${resourceId}: новый max=${resource.max}`);
  }
  
  // Применение эффекта на производство ресурса
  private applyProductionBoostEffect(
    resources: Record<string, Resource>,
    effectType: string,
    effectValue: any
  ): void {
    // Определяем ID ресурса из эффекта
    const resourceId = this.extractResourceIdFromEffect(effectType);
    
    if (!resourceId || !resources[resourceId]) {
      console.warn(`[EffectService] Ресурс не найден для эффекта ${effectType}`);
      return;
    }
    
    const resource = resources[resourceId];
    const numValue = Number(effectValue);
    
    // Применяем бонус к производству
    if (numValue >= 1.0) {
      resource.production = (resource.production || 0) * numValue;
      resource.perSecond = (resource.perSecond || 0) * numValue;
    } else {
      resource.production = (resource.production || 0) * (1 + numValue);
      resource.perSecond = (resource.perSecond || 0) * (1 + numValue);
    }
    
    console.log(`[EffectService] Применен productionBoost для ${resourceId}: новое production=${resource.production}`);
  }
  
  // Извлекаем ID ресурса из названия эффекта
  private extractResourceIdFromEffect(effectType: string): string | null {
    // Удаляем распространенные суффиксы
    const cleanedEffectType = effectType
      .replace('maxboost', '')
      .replace('productionboost', '')
      .replace('boost', '')
      .replace('efficiency', '');
    
    // Маппинг к ID ресурсов
    const resourceMapping: Record<string, string> = {
      'knowledge': 'knowledge',
      'usdt': 'usdt',
      'bitcoin': 'bitcoin',
      'electricity': 'electricity',
      'computingpower': 'computingPower',
      'computing': 'computingPower'
    };
    
    // Проходим по всем ключам маппинга и находим совпадения
    for (const [key, value] of Object.entries(resourceMapping)) {
      if (cleanedEffectType.includes(key)) {
        return value;
      }
    }
    
    return null;
  }
  
  // Метод для обновления эффектов потребления ресурсов
  updateConsumptionEffects(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Сбрасываем потребление для всех ресурсов
    for (const resourceId in resources) {
      resources[resourceId].consumption = 0;
    }
    
    // Рассчитываем потребление ресурсов для каждого здания
    for (const buildingId in newState.buildings) {
      const building = newState.buildings[buildingId];
      
      if (building.count > 0 && building.consumption) {
        for (const [resourceId, consumption] of Object.entries(building.consumption)) {
          if (resources[resourceId]) {
            const resourceConsumption = resources[resourceId].consumption || 0;
            resources[resourceId].consumption = resourceConsumption + 
              (consumption as number) * building.count;
          }
        }
      }
    }
    
    // Обновляем фактическое производство с учетом потребления
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      resource.perSecond = resource.production - resource.consumption;
    }
    
    newState.resources = resources;
    return newState;
  }
}
