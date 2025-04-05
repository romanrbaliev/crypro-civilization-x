
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
    // Разбираем тип эффекта (например "knowledgeMaxBoost")
    const [resourceId, effectName] = effectType.split(/(?=[A-Z])/);
    
    if (!resourceId) return;
    
    // Применяем эффект к соответствующему ресурсу
    if (resources[resourceId.toLowerCase()]) {
      const resource = resources[resourceId.toLowerCase()];
      
      switch (effectName.toLowerCase()) {
        case 'maxboost':
          resource.max *= (1 + Number(effectValue));
          break;
        case 'productionboost':
          resource.production *= (1 + Number(effectValue));
          resource.perSecond *= (1 + Number(effectValue));
          break;
        case 'efficiencyboost':
          // Этот эффект обрабатывается в других местах
          break;
      }
    }
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
