
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { ResourceFormatter } from '@/formatters/ResourceFormatter';

export class ResourceSystem {
  private formatter: ResourceFormatter;
  
  constructor() {
    this.formatter = new ResourceFormatter();
  }
  
  /**
   * Инкрементирует значение ресурса
   */
  incrementResource(
    state: GameState, 
    payload: { resourceId: string; amount?: number }
  ): GameState {
    const { resourceId, amount = 1 } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource || !resource.unlocked) {
      console.warn(`Попытка инкрементировать неразблокированный ресурс: ${resourceId}`);
      return state;
    }
    
    const incrementAmount = Math.max(0, amount);
    const newValue = Math.min(
      resource.value + incrementAmount,
      resource.max || Number.MAX_SAFE_INTEGER
    );
    
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          value: newValue
        }
      }
    };
  }
  
  /**
   * Разблокирует ресурс
   */
  unlockResource(
    state: GameState, 
    payload: { resourceId: string }
  ): GameState {
    const { resourceId } = payload;
    const resource = state.resources[resourceId];
    
    if (!resource) {
      console.warn(`Попытка разблокировать несуществующий ресурс: ${resourceId}`);
      return state;
    }
    
    if (resource.unlocked) {
      // Ресурс уже разблокирован
      return state;
    }
    
    // Разблокируем ресурс
    return {
      ...state,
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          unlocked: true
        }
      }
    };
  }
  
  /**
   * Проверяет, достаточно ли ресурсов для покупки
   */
  checkAffordability(state: GameState, cost: Record<string, number>): boolean {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Возвращает список недостающих ресурсов
   */
  getMissingResources(state: GameState, cost: Record<string, number>): Record<string, number> {
    const missingResources: Record<string, number> = {};
    
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = state.resources[resourceId];
      const amountNeeded = Number(amount);
      
      if (!resource || resource.value < amountNeeded) {
        const missing = resource ? Math.max(0, amountNeeded - resource.value) : amountNeeded;
        missingResources[resourceId] = missing;
      }
    }
    
    return missingResources;
  }
  
  /**
   * Обновляет ресурсы на основе производства и прошедшего времени
   */
  updateResources(state: GameState, deltaTime: number): GameState {
    // Если дельта времени меньше или равна нулю, просто обновляем производство
    if (deltaTime <= 0) {
      return this.updateResourceProduction(state);
    }
    
    // Преобразуем миллисекунды в секунды
    const deltaSeconds = deltaTime / 1000;
    
    // Создаем копию состояния
    let updatedState = { ...state };
    const resources = { ...state.resources };
    
    console.log(`Обновление ресурсов, прошло ${deltaSeconds.toFixed(2)} секунд`);
    
    // Обрабатываем каждый ресурс
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      
      // Пропускаем неразблокированные ресурсы
      if (!resource.unlocked) {
        console.log(`Ресурс ${resourceId} не разблокирован, пропускаем...`);
        continue;
      }
      
      // Получаем значения производства и потребления
      const production = resource.production || 0;
      const consumption = resource.consumption || 0;
      
      // Рассчитываем чистое изменение ресурса
      const netChange = (production - consumption) * deltaSeconds;
      
      if (netChange !== 0) {
        // Обновляем значение ресурса
        let newValue = resource.value + netChange;
        
        // Ограничиваем значение максимумом, если он установлен
        if (resource.max !== undefined && resource.max !== null) {
          newValue = Math.min(newValue, resource.max);
        }
        
        // Не допускаем отрицательных значений
        newValue = Math.max(0, newValue);
        
        if (Math.abs(newValue - resource.value) > 0.001) {
          console.log(`Ресурс ${resourceId}: ${resource.value.toFixed(2)} -> ${newValue.toFixed(2)} (изменение: ${netChange.toFixed(2)}, продукция: ${production}/сек, потребление: ${consumption}/сек)`);
        }
        
        // Обновляем ресурс
        resources[resourceId] = {
          ...resource,
          value: newValue
        };
      }
    }
    
    updatedState.resources = resources;
    return updatedState;
  }
  
  /**
   * Обновляет производство ресурсов на основе зданий
   */
  updateResourceProduction(state: GameState): GameState {
    console.log("Обновление производства ресурсов на основе зданий");
    const resources = { ...state.resources };
    
    // Сначала обнуляем всё производство для каждого ресурса
    for (const resourceId in resources) {
      resources[resourceId] = {
        ...resources[resourceId],
        production: 0,
        consumption: 0
      };
    }
    
    // Обрабатываем производство от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count <= 0) continue;
      
      console.log(`Обрабатываем производство здания ${buildingId} (количество: ${building.count})`);
      
      // Обрабатываем производство
      if (building.production) {
        for (const resourceId in building.production) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const currentProduction = resources[resourceId].production || 0;
            const buildingProduction = building.production[resourceId] * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              production: currentProduction + buildingProduction
            };
            
            console.log(`Здание ${buildingId} (${building.count} шт.) производит ${resourceId}: ${buildingProduction} в секунду`);
          } else {
            console.log(`Ресурс ${resourceId} не существует или не разблокирован`);
          }
        }
      } else {
        console.log(`У здания ${buildingId} нет настроек производства`);
      }
      
      // Обрабатываем потребление
      if (building.consumption) {
        for (const resourceId in building.consumption) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const currentConsumption = resources[resourceId].consumption || 0;
            const buildingConsumption = building.consumption[resourceId] * building.count;
            
            resources[resourceId] = {
              ...resources[resourceId],
              consumption: currentConsumption + buildingConsumption
            };
            
            console.log(`Здание ${buildingId} потребляет ${resourceId}: ${buildingConsumption} в секунду`);
          }
        }
      }
    }
    
    // Рассчитываем perSecond для каждого ресурса
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      if (resource.unlocked) {
        resources[resourceId] = {
          ...resource,
          perSecond: (resource.production || 0) - (resource.consumption || 0)
        };
        console.log(`Обновлен перерасчет скорости ресурса ${resourceId}: ${resources[resourceId].perSecond}/сек`);
      }
    }
    
    return {
      ...state,
      resources
    };
  }
  
  /**
   * Обновляет максимальные значения ресурсов
   */
  updateResourceMaxValues(state: GameState): GameState {
    const resources = { ...state.resources };
    
    // Устанавливаем базовые максимальные значения
    if (resources.knowledge) {
      resources.knowledge = {
        ...resources.knowledge,
        max: 100 // Базовое значение
      };
    }
    
    if (resources.usdt) {
      resources.usdt = {
        ...resources.usdt,
        max: 100 // Базовое значение
      };
    }
    
    // Учитываем бонусы от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count <= 0) continue;
      
      // Проверяем наличие эффектов у здания
      if (building.effects) {
        // Проверяем конкретные эффекты для ресурсов
        if (building.effects.maxUSDTBoost && resources.usdt) {
          resources.usdt = {
            ...resources.usdt,
            max: (resources.usdt.max || 100) + (Number(building.effects.maxUSDTBoost) * building.count)
          };
        }
        
        if (building.effects.maxKnowledgePercentBoost && resources.knowledge) {
          resources.knowledge = {
            ...resources.knowledge,
            max: (resources.knowledge.max || 100) * (1 + Number(building.effects.maxKnowledgePercentBoost) * building.count)
          };
        }
        
        if (building.effects.maxKnowledgeBoost && resources.knowledge) {
          resources.knowledge = {
            ...resources.knowledge,
            max: (resources.knowledge.max || 100) + (Number(building.effects.maxKnowledgeBoost) * building.count)
          };
        }
      }
    }
    
    // Учитываем бонусы от улучшений
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (!upgrade.purchased) continue;
      
      // Учитываем эффекты улучшений
      if (upgrade.effects) {
        // Бонусы к максимуму knowledge
        if (upgrade.effects.knowledgeMaxBoost && resources.knowledge) {
          const knowledgeMax = resources.knowledge.max || 100;
          resources.knowledge = {
            ...resources.knowledge,
            max: knowledgeMax * (1 + Number(upgrade.effects.knowledgeMaxBoost))
          };
        }
        
        if (upgrade.effects.maxKnowledgePercentBoost && resources.knowledge) {
          const knowledgeMax = resources.knowledge.max || 100;
          resources.knowledge = {
            ...resources.knowledge,
            max: knowledgeMax * (1 + Number(upgrade.effects.maxKnowledgePercentBoost))
          };
        }
        
        // Бонусы к максимуму USDT
        if (upgrade.effects.usdtMaxBoost && resources.usdt) {
          const usdtMax = resources.usdt.max || 100;
          resources.usdt = {
            ...resources.usdt,
            max: usdtMax * (1 + Number(upgrade.effects.usdtMaxBoost))
          };
        }
        
        if (upgrade.effects.maxUSDTPercentBoost && resources.usdt) {
          const usdtMax = resources.usdt.max || 100;
          resources.usdt = {
            ...resources.usdt,
            max: usdtMax * (1 + Number(upgrade.effects.maxUSDTPercentBoost))
          };
        }
      }
    }
    
    return {
      ...state,
      resources
    };
  }
  
  /**
   * Полностью пересчитывает всё производство для всех ресурсов
   */
  recalculateAllResourceProduction(state: GameState): GameState {
    console.log("Пересчет производства всех ресурсов");
    // Сначала обновляем максимальные значения ресурсов
    state = this.updateResourceMaxValues(state);
    // Затем пересчитываем производство
    state = this.updateResourceProduction(state);
    
    // Дополнительно выводим информацию о текущем производстве
    for (const resourceId in state.resources) {
      const resource = state.resources[resourceId];
      if (resource.unlocked) {
        console.log(`Ресурс ${resourceId}: производство ${resource.production || 0}/сек, потребление ${resource.consumption || 0}/сек, итого ${resource.perSecond || 0}/сек`);
      }
    }
    
    return state;
  }
}
