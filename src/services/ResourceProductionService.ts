import { GameState } from '@/context/types';
import { Building } from '@/context/types';
import { Upgrade } from '@/context/types';
import { BonusCalculationService } from './BonusCalculationService';

export class ResourceProductionService {
  private bonusCalculationService: BonusCalculationService;
  
  constructor() {
    this.bonusCalculationService = new BonusCalculationService();
  }

  calculateBuildingProduction(building: Building): { [resourceId: string]: number } {
    const production: { [resourceId: string]: number } = {};

    for (const resourceId in building.production) {
      production[resourceId] = building.production[resourceId] || 0;
    }

    return production;
  }

  calculateBuildingConsumption(building: Building): { [resourceId: string]: number } {
    const consumption: { [resourceId: string]: number } = {};

    for (const resourceId in building.consumption) {
      consumption[resourceId] = building.consumption[resourceId] || 0;
    }

    return consumption;
  }

  calculateResourceProduction(state: GameState): { [key: string]: any } {
    // Создаем копию ресурсов для изменения
    const updatedResources = JSON.parse(JSON.stringify(state.resources));
    
    // Проверяем, что критические ресурсы существуют
    this.ensureCriticalResources(updatedResources, state);
    
    // Сбрасываем значения perSecond для всех ресурсов
    for (const resourceId in updatedResources) {
      if (updatedResources[resourceId].unlocked) {
        updatedResources[resourceId].perSecond = 0;
      }
    }
    
    // Применяем базовое производство для знаний
    if (updatedResources.knowledge) {
      // Если baseProduction не определено, инициализируем его
      if (typeof updatedResources.knowledge.baseProduction !== 'number') {
        updatedResources.knowledge.baseProduction = 0;
      }
      
      // Добавляем базовое производство к perSecond
      updatedResources.knowledge.perSecond += updatedResources.knowledge.baseProduction;
      console.log(`ResourceProductionService: Базовое производство знаний: ${updatedResources.knowledge.baseProduction}/сек`);
    }
    
    // Особая обработка для практики (она даёт фиксированный прирост знаний)
    if (state.buildings.practice && state.buildings.practice.count > 0 && updatedResources.knowledge) {
      // Точное значение от практики - 0.21 за уровень
      const baseKnowledgeFromPractice = 0.21 * state.buildings.practice.count;
      
      // Применяем множитель производства знаний от бонусов
      const { productionMultiplier } = this.bonusCalculationService.calculateResourceBonuses(state, 'knowledge');
      const knowledgeFromPractice = baseKnowledgeFromPractice * productionMultiplier;
      
      updatedResources.knowledge.perSecond += knowledgeFromPractice;
      console.log(`ResourceProductionService: Знания от практики: ${baseKnowledgeFromPractice.toFixed(3)}/сек (с множителем ${productionMultiplier.toFixed(2)}: ${knowledgeFromPractice.toFixed(3)}/сек)`);
    }
    
    // Особая обработка Bitcoin для майнеров
    if (state.buildings.autoMiner && 
        state.buildings.autoMiner.count > 0 && 
        updatedResources.bitcoin && 
        updatedResources.bitcoin.unlocked) {
      // Базовое производство Bitcoin от автомайнера
      const baseBitcoinPerSecond = 0.00005 * state.buildings.autoMiner.count;
      
      // Получаем множитель эффективности майнинга
      const miningEfficiency = this.bonusCalculationService.calculateMiningEfficiency(state);
      
      // Применяем множитель
      const bitcoinProduction = baseBitcoinPerSecond * miningEfficiency;
      updatedResources.bitcoin.perSecond = bitcoinProduction;
      
      console.log(`ResourceProductionService: Bitcoin от майнеров: ${baseBitcoinPerSecond.toFixed(6)}/сек (с множителем ${miningEfficiency.toFixed(2)}: ${bitcoinProduction.toFixed(6)}/сек)`);
    }
    
    // Рассчитываем производство от других зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (!building.unlocked || building.count <= 0 || !building.production) continue;
      
      // Пропускаем уже обработанные здания (практика, автомайнер)
      if (buildingId === 'practice' || buildingId === 'autoMiner') continue;
      
      for (const resourceId in building.production) {
        if (!updatedResources[resourceId] || !updatedResources[resourceId].unlocked) continue;
        
        // Базовое производство от здания
        const baseProduction = building.production[resourceId] * building.count;
        
        // Получаем множитель производства для ресурса
        const { productionMultiplier } = this.bonusCalculationService.calculateResourceBonuses(state, resourceId);
        
        // Применяем множитель
        const finalProduction = baseProduction * productionMultiplier;
        updatedResources[resourceId].perSecond += finalProduction;
        
        console.log(`ResourceProductionService: ${building.name} производит ${resourceId}: ${baseProduction.toFixed(3)}/сек (с множителем ${productionMultiplier.toFixed(2)}: ${finalProduction.toFixed(3)}/сек)`);
      }
    }
    
    // Рассчитываем потребление от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (!building.unlocked || building.count <= 0 || !building.consumption) continue;
      
      for (const resourceId in building.consumption) {
        if (!updatedResources[resourceId] || !updatedResources[resourceId].unlocked) continue;
        
        const consumption = building.consumption[resourceId] * building.count;
        updatedResources[resourceId].perSecond -= consumption;
        
        console.log(`ResourceProductionService: ${building.name} потребляет ${resourceId}: ${consumption.toFixed(3)}/сек`);
      }
    }
    
    // Ещё раз логируем состояние производства знаний после всех расчётов
    if (updatedResources.knowledge) {
      console.log(`ResourceProductionService: Итоговая скорость производства знаний: ${updatedResources.knowledge.perSecond.toFixed(3)}/сек`);
    }
    
    return updatedResources;
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
        console.log(`ResourceProductionService: Критический ресурс ${resource.id} не найден, создаем его...`);
        
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
  }
}
