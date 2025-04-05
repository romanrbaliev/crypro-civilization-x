
import { GameState, Resource } from '@/context/types';

export class ResourceProductionService {
  /**
   * Рассчитывает и обновляет производство ресурсов
   * @param state Текущее состояние игры
   * @returns Обновленные ресурсы
   */
  public calculateResourceProduction(state: GameState): { [key: string]: Resource } {
    const updatedResources = { ...state.resources };
    
    // Сначала сбрасываем все значения perSecond
    for (const resourceId in updatedResources) {
      updatedResources[resourceId] = {
        ...updatedResources[resourceId],
        perSecond: 0
      };
    }
    
    // Рассчитываем производство от зданий
    this.calculateBuildingProduction(state, updatedResources);
    
    // Применяем множители производства от улучшений
    this.applyProductionMultipliers(state, updatedResources);
    
    return updatedResources;
  }
  
  /**
   * Рассчитывает производство ресурсов от зданий
   * @param state Текущее состояние игры
   * @param resources Ресурсы для обновления
   */
  private calculateBuildingProduction(
    state: GameState,
    resources: { [key: string]: Resource }
  ): void {
    // Проходим по всем зданиям
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      // Если у здания есть производство и оно построено
      if (building.production && building.count > 0) {
        // Рассчитываем производство для каждого ресурса
        for (const resourceId in building.production) {
          const productionPerSecond = building.production[resourceId] * building.count;
          
          if (resources[resourceId] && resources[resourceId].unlocked) {
            resources[resourceId].perSecond += productionPerSecond;
          }
        }
      }
      
      // Если у здания есть потребление и оно построено
      if (building.consumption && building.count > 0) {
        // Рассчитываем потребление для каждого ресурса
        for (const resourceId in building.consumption) {
          const consumptionPerSecond = building.consumption[resourceId] * building.count;
          
          if (resources[resourceId] && resources[resourceId].unlocked) {
            resources[resourceId].perSecond -= consumptionPerSecond;
          }
        }
      }
    }
  }
  
  /**
   * Применяет множители производства от улучшений
   * @param state Текущее состояние игры
   * @param resources Ресурсы для обновления
   */
  private applyProductionMultipliers(
    state: GameState,
    resources: { [key: string]: Resource }
  ): void {
    // Проходим по всем купленным улучшениям
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      // Если улучшение куплено и у него есть эффекты
      if (upgrade.purchased && upgrade.effects) {
        // Применяем эффекты для ресурсов
        for (const effectId in upgrade.effects) {
          // Если эффект влияет на производство ресурса
          if (effectId.includes('ProductionMultiplier')) {
            const resourceId = effectId.replace('ProductionMultiplier', '').toLowerCase();
            
            if (resources[resourceId] && resources[resourceId].unlocked) {
              // Применяем множитель к скорости производства
              resources[resourceId].perSecond *= upgrade.effects[effectId];
            }
          }
          
          // Если эффект влияет на максимальное кол-во ресурса
          else if (effectId.includes('MaxMultiplier')) {
            const resourceId = effectId.replace('MaxMultiplier', '').toLowerCase();
            
            if (resources[resourceId] && resources[resourceId].unlocked) {
              // Применяем множитель к максимальному значению
              resources[resourceId].max *= upgrade.effects[effectId];
            }
          }
        }
      }
    }
  }
}
