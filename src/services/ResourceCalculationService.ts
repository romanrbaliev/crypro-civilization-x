
import { GameState } from '@/context/types';
import { updateResourceMaxValues } from '@/context/utils/resourceUtils';

/**
 * Сервис для расчета производства и потребления ресурсов.
 * Централизует всю логику расчета ресурсов и обеспечивает ее единообразное применение.
 */
export class ResourceCalculationService {
  /**
   * Пересчитывает значения всех ресурсов
   */
  public recalculateAllResources(state: GameState): GameState {
    console.log('ResourceCalculationService: Пересчет всех ресурсов');
    
    try {
      // Создаем копию состояния
      let newState = { ...state };
      
      // 1. Рассчитываем максимальные значения для ресурсов
      newState = updateResourceMaxValues(newState);
      
      // 2. Рассчитываем производство и потребление для ресурсов
      const resources = this.calculateResourceProduction(newState);
      newState.resources = resources;
      
      // 3. Обновляем значения ресурсов с учетом прошедшего времени
      if (newState.lastUpdate) {
        const now = Date.now();
        const elapsedSeconds = (now - newState.lastUpdate) / 1000;
        
        if (elapsedSeconds > 0 && newState.gameStarted) {
          newState = this.updateResourceValues(newState, elapsedSeconds);
          newState.lastUpdate = now;
          newState.gameTime = state.gameTime + elapsedSeconds;
        }
      }
      
      return newState;
    } catch (error) {
      console.error('ResourceCalculationService: Ошибка при пересчете ресурсов:', error);
      return state;
    }
  }

  /**
   * Полностью перестраивает расчеты ресурсов с нуля
   */
  public rebuildAllResources(state: GameState): GameState {
    console.log('ResourceCalculationService: Полная перестройка ресурсов');
    
    // Пересчитываем все ресурсы с нуля
    return this.recalculateAllResources(state);
  }

  /**
   * Рассчитывает производство и потребление ресурсов
   */
  public calculateResourceProduction(state: GameState): { [key: string]: any } {
    // Создаем копию ресурсов для изменения
    const updatedResources = JSON.parse(JSON.stringify(state.resources));
    
    // Проверяем, что критические ресурсы существуют и разблокированы
    this.ensureCriticalResources(updatedResources, state);
    
    // Сбрасываем значения perSecond для всех ресурсов
    this.resetResourceProduction(updatedResources);
    
    // Рассчитываем базовое производство
    this.calculateBaseProduction(updatedResources, state);
    
    // Рассчитываем производство от зданий
    this.calculateBuildingProduction(updatedResources, state);
    
    // Рассчитываем потребление от зданий
    this.calculateBuildingConsumption(updatedResources, state);
    
    // Применяем бонусы от специализации и синергий
    this.applySpecializationBonuses(updatedResources, state);
    
    // Логируем производство знаний для проверки
    if (updatedResources.knowledge) {
      console.log(`ResourceCalculationService: Итоговая скорость производства знаний: ${updatedResources.knowledge.perSecond.toFixed(3)}/сек`);
    }
    
    return updatedResources;
  }

  /**
   * Обновляет значения ресурсов с учетом прошедшего времени
   */
  private updateResourceValues(state: GameState, deltaTime: number): GameState {
    const updatedResources = { ...state.resources };
    
    // Обновляем значения каждого ресурса
    Object.keys(updatedResources).forEach(resourceId => {
      const resource = updatedResources[resourceId];
      if (!resource.unlocked) return;
      
      // Рассчитываем новое значение на основе производства за секунду
      let newValue = resource.value + resource.perSecond * deltaTime;
      
      // Ограничиваем максимумом
      if (resource.max !== undefined && resource.max !== Infinity) {
        newValue = Math.min(newValue, resource.max);
      }
      
      // Обновляем значение ресурса (не позволяем опуститься ниже нуля)
      resource.value = Math.max(0, newValue);
    });
    
    return {
      ...state,
      resources: updatedResources
    };
  }

  /**
   * Проверяет наличие критических ресурсов и создает их при необходимости
   */
  private ensureCriticalResources(resources: { [key: string]: any }, state: GameState): void {
    // Список критических ресурсов
    const criticalResources = [
      {
        id: 'knowledge',
        name: 'Знания',
        description: 'Знания о криптовалюте и блокчейне',
        type: 'resource',
        icon: 'book',
        baseMax: 100
      },
      {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, универсальная валюта для покупок',
        type: 'currency',
        icon: 'coins',
        baseMax: 50
      },
      {
        id: 'electricity',
        name: 'Электричество',
        description: 'Электроэнергия для питания устройств',
        type: 'resource',
        icon: 'zap',
        baseMax: 100
      },
      {
        id: 'computingPower',
        name: 'Вычислительная мощность',
        description: 'Вычислительная мощность для майнинга',
        type: 'resource',
        icon: 'cpu',
        baseMax: 1000
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        description: 'Bitcoin - первая и основная криптовалюта',
        type: 'currency',
        icon: 'bitcoin',
        baseMax: 0.01
      }
    ];
    
    // Проверяем каждый критический ресурс
    for (const resource of criticalResources) {
      // Проверяем только те ресурсы, которые должны быть разблокированы
      if (!state.unlocks[resource.id] && resource.id !== 'knowledge') continue;
      
      if (!resources[resource.id]) {
        console.log(`ResourceCalculationService: Критический ресурс ${resource.id} не найден, создаем его...`);
        
        // Создаем ресурс с базовыми параметрами
        resources[resource.id] = {
          id: resource.id,
          name: resource.name,
          description: resource.description,
          type: resource.type,
          icon: resource.icon,
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: resource.baseMax,
          unlocked: resource.id === 'knowledge' ? true : !!state.unlocks[resource.id]
        };
      }
    }
    
    // Для Bitcoin применяем особую обработку
    if (resources.bitcoin && state.buildings.autoMiner?.count > 0) {
      resources.bitcoin.perSecond = 0.00005 * state.buildings.autoMiner.count * (state.miningParams?.miningEfficiency || 1);
    }
  }

  /**
   * Сбрасывает скорости производства ресурсов
   */
  private resetResourceProduction(resources: { [key: string]: any }): void {
    for (const resourceId in resources) {
      if (resources[resourceId].unlocked) {
        resources[resourceId].perSecond = 0;
      }
    }
  }

  /**
   * Рассчитывает базовое производство ресурсов
   */
  private calculateBaseProduction(resources: { [key: string]: any }, state: GameState): void {
    // Для знаний
    if (resources.knowledge) {
      // Учитываем базовое производство
      const baseProduction = resources.knowledge.baseProduction || 0;
      resources.knowledge.perSecond += baseProduction;
      
      console.log(`ResourceCalculationService: Базовое производство знаний: ${baseProduction}/сек`);
    }
    
    // Для Bitcoin от автомайнеров
    if (resources.bitcoin && state.buildings.autoMiner?.count > 0) {
      const miningEfficiency = state.miningParams?.miningEfficiency || 1;
      const bitcoinProduction = 0.00005 * state.buildings.autoMiner.count * miningEfficiency;
      
      resources.bitcoin.perSecond = bitcoinProduction;
      
      console.log(`ResourceCalculationService: Производство Bitcoin от автомайнеров: ${bitcoinProduction.toFixed(6)}/сек`);
    }
  }

  /**
   * Рассчитывает производство ресурсов от зданий
   */
  private calculateBuildingProduction(resources: { [key: string]: any }, state: GameState): void {
    // Проходим по всем зданиям
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.unlocked && building.count > 0 && building.production) {
        // Считаем производство для каждого ресурса
        for (const resourceId in building.production) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const productionPerSecond = building.production[resourceId] * building.count;
            resources[resourceId].perSecond += productionPerSecond;
            
            console.log(`ResourceCalculationService: ${building.name} производит ${productionPerSecond.toFixed(3)} ${resourceId}/сек`);
          }
        }
      }
    }
    
    // Особый случай для практики
    if (state.buildings.practice && state.buildings.practice.count > 0) {
      if (resources.knowledge) {
        const baseProductionPerPractice = 0.21;
        let practiceKnowledgeProduction = baseProductionPerPractice * state.buildings.practice.count;
        
        // Проверяем наличие исследования "Основы блокчейна"
        const blockchainBasicsPurchased = this.isBlockchainBasicsPurchased(state);
        if (blockchainBasicsPurchased) {
          practiceKnowledgeProduction *= 1.1; // +10% от исследования
          console.log(`ResourceCalculationService: Бонус от Основ блокчейна применен к практике: ${practiceKnowledgeProduction.toFixed(3)} знаний/сек`);
        }
        
        resources.knowledge.perSecond += practiceKnowledgeProduction;
        console.log(`ResourceCalculationService: Практика добавляет ${practiceKnowledgeProduction.toFixed(3)} знаний/сек`);
      }
    }
  }

  /**
   * Рассчитывает потребление ресурсов от зданий
   */
  private calculateBuildingConsumption(resources: { [key: string]: any }, state: GameState): void {
    // Проходим по всем зданиям
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.unlocked && building.count > 0 && building.consumption) {
        // Считаем потребление для каждого ресурса
        for (const resourceId in building.consumption) {
          if (resources[resourceId] && resources[resourceId].unlocked) {
            const consumptionPerSecond = building.consumption[resourceId] * building.count;
            resources[resourceId].perSecond -= consumptionPerSecond;
            
            console.log(`ResourceCalculationService: ${building.name} потребляет ${consumptionPerSecond.toFixed(3)} ${resourceId}/сек`);
          }
        }
      }
    }
  }

  /**
   * Применяет бонусы от специализации и синергий
   */
  private applySpecializationBonuses(resources: { [key: string]: any }, state: GameState): void {
    // Если специализация выбрана
    if (state.specialization) {
      console.log(`ResourceCalculationService: Применение бонусов специализации ${state.specialization}`);
      
      // Применяем бонусы в зависимости от специализации
      switch (state.specialization) {
        case 'miner':
          // Бонусы для майнера
          if (resources.computingPower) {
            resources.computingPower.perSecond *= 1.25; // +25% к вычислительной мощности
            console.log(`ResourceCalculationService: Бонус майнера к вычислительной мощности +25%`);
          }
          if (resources.bitcoin) {
            resources.bitcoin.perSecond *= 1.40; // +40% к производству Bitcoin
            console.log(`ResourceCalculationService: Бонус майнера к производству Bitcoin +40%`);
          }
          break;
        
        case 'trader':
          // Бонусы для трейдера
          if (resources.usdt) {
            resources.usdt.perSecond *= 1.15; // +15% к USDT
            console.log(`ResourceCalculationService: Бонус трейдера к USDT +15%`);
          }
          break;
        
        case 'investor':
          // Бонусы для инвестора
          for (const resourceId in resources) {
            if (resources[resourceId].unlocked) {
              resources[resourceId].perSecond *= 1.05; // +5% ко всем ресурсам
            }
          }
          console.log(`ResourceCalculationService: Бонус инвестора ко всем ресурсам +5%`);
          break;
        
        case 'analyst':
          // Бонусы для аналитика
          if (resources.knowledge) {
            resources.knowledge.perSecond *= 1.25; // +25% к знаниям
            console.log(`ResourceCalculationService: Бонус аналитика к знаниям +25%`);
          }
          break;
        
        case 'influencer':
          // Бонусы для инфлюенсера
          for (const resourceId in resources) {
            if (resources[resourceId].unlocked) {
              resources[resourceId].perSecond *= 1.1; // +10% ко всем ресурсам
            }
          }
          console.log(`ResourceCalculationService: Бонус инфлюенсера ко всем ресурсам +10%`);
          break;
      }
    }
    
    // Здесь же можно применить бонусы от синергий
    // ...
  }

  /**
   * Проверяет, куплено ли исследование "Основы блокчейна" в любом из его вариантов
   */
  private isBlockchainBasicsPurchased(state: GameState): boolean {
    return (
      (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased)
    );
  }
}
