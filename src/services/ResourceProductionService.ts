import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Сервис для расчета производства ресурсов
 */
export class ResourceProductionService {
  /**
   * Рассчитывает производство всех ресурсов на основе зданий и эффектов
   */
  calculateResourceProduction(state: GameState): { [key: string]: any } {
    console.log("ResourceProductionService: Расчет производства ресурсов");
    
    // Создаем копию ресурсов для обновления
    const updatedResources = { ...state.resources };
    
    // Расчет производства знаний
    this.calculateKnowledgeProduction(state, updatedResources);
    
    // Расчет электричества
    this.calculateElectricityProduction(state, updatedResources);
    
    // Расчет вычислительной мощности
    this.calculateComputingPowerProduction(state, updatedResources);
    
    // Расчет майнинга Bitcoin
    this.calculateBitcoinProduction(state, updatedResources);
    
    return updatedResources;
  }
  
  /**
   * Рассчитывает производство знаний
   */
  private calculateKnowledgeProduction(state: GameState, resources: { [key: string]: any }): void {
    if (!resources.knowledge || !resources.knowledge.unlocked) return;
    
    // Базовое производство от здания "Практика" - фиксированное 1 знание/сек
    const practiceCount = state.buildings.practice?.count || 0;
    const baseProduction = practiceCount === 0 ? 0 : 1; // Базовое значение 1/сек для одной практики
    
    // Расчет множителя производства (бонусы от исследований)
    let productionMultiplier = 1.0;
    
    // Проверяем наличие улучшения "Основы блокчейна"
    const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased ||
                              state.upgrades.blockchain_basics?.purchased ||
                              state.upgrades.basicBlockchain?.purchased;
    
    // Применяем бонус от "Основы блокчейна" - +10% к производству знаний
    if (hasBlockchainBasics) {
      productionMultiplier *= 1.1;
      console.log("ResourceProductionService: Применен бонус +10% к производству знаний от Основ блокчейна");
    }
    
    // Бонус от интернет-канала
    if (state.buildings.internetConnection?.count > 0) {
      productionMultiplier *= 1.2; // +20% к скорости получения знаний
      console.log("ResourceProductionService: Применен бонус +20% к производству знаний от Интернет-канала");
    }
    
    // Итоговое производство в секунду
    const totalProduction = baseProduction * productionMultiplier;
    
    // Обновляем свойства ресурса
    resources.knowledge = {
      ...resources.knowledge,
      baseProduction, // Базовое производство без модификаторов
      production: totalProduction, // Производство с учётом всех модификаторов
      perSecond: totalProduction // Итоговое производство в секунду
    };
    
    console.log(`ResourceProductionService: Итоговое производство knowledge: ${totalProduction.toFixed(2)} (базовое: ${baseProduction}, множитель: ${productionMultiplier})`);
  }
  
  /**
   * Рассчитывает производство электричества
   */
  private calculateElectricityProduction(state: GameState, resources: { [key: string]: any }): void {
    if (!resources.electricity || !resources.electricity.unlocked) return;
    
    // Базовое производство от генераторов (0.5 электричества/сек за один генератор)
    const generatorCount = state.buildings.generator?.count || 0;
    const baseProduction = generatorCount * 0.5;
    
    // Потребление электричества
    let consumption = 0;
    
    // Суммируем потребление от всех устройств
    if (state.buildings.homeComputer?.count > 0) {
      consumption += state.buildings.homeComputer.count * 1; // 1 электричество/сек за компьютер
    }
    
    if (state.buildings.autoMiner?.count > 0) {
      consumption += state.buildings.autoMiner.count * 1; // 1 электричество/сек за автомайнер
    }
    
    // Расчет множителя производства (бонусы от исследований)
    let productionMultiplier = 1.0;
    
    // Расчет множителя потребления (бонусы от исследований)
    let consumptionMultiplier = 1.0;
    
    // Итоговое производство в секунду (с учетом потребления)
    const totalProduction = baseProduction * productionMultiplier;
    const totalConsumption = consumption * consumptionMultiplier;
    const netProduction = totalProduction - totalConsumption;
    
    // Обновляем свойства ресурса
    resources.electricity = {
      ...resources.electricity,
      baseProduction, // Базовое производство без модификаторов
      production: totalProduction, // Производство с учётом всех модификаторов
      consumption: totalConsumption, // Потребление электричества
      perSecond: netProduction // Итоговое производство в секунду (может быть отрицательным)
    };
    
    console.log(`ResourceProductionService: Базовое производство электричества: ${baseProduction.toFixed(2)} (${generatorCount} × 0.5)`);
    console.log(`ResourceProductionService: Потребление электричества: ${totalConsumption.toFixed(2)}`);
    console.log(`ResourceProductionService: Чистое производство электричества: ${netProduction.toFixed(2)}`);
  }
  
  /**
   * Рассчитывает производство вычислительной мощности
   */
  private calculateComputingPowerProduction(state: GameState, resources: { [key: string]: any }): void {
    if (!resources.computingPower || !resources.computingPower.unlocked) return;
    
    // Базовое производство от здания "Практика" - фиксированное 1 знание/сек
    const practiceCount = state.buildings.practice?.count || 0;
    const baseProduction = practiceCount === 0 ? 0 : 1; // Базовое значение 1/сек для одной практики
    
    // Расчет множителя производства (бонусы от исследований)
    let productionMultiplier = 1.0;
    
    // Проверяем наличие улучшения "Основы блокчейна"
    const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased ||
                              state.upgrades.blockchain_basics?.purchased ||
                              state.upgrades.basicBlockchain?.purchased;
    
    // Применяем бонус от "Основы блокчейна" - +10% к производству знаний
    if (hasBlockchainBasics) {
      productionMultiplier *= 1.1;
      console.log("ResourceProductionService: Применен бонус +10% к производству знаний от Основ блокчейна");
    }
    
    // Бонус от интернет-канала
    if (state.buildings.internetConnection?.count > 0) {
      productionMultiplier *= 1.2; // +20% к скорости получения знаний
      console.log("ResourceProductionService: Применен бонус +20% к производству знаний от Интернет-канала");
    }
    
    // Итоговое производство в секунду
    const totalProduction = baseProduction * productionMultiplier;
    
    // Обновляем свойства ресурса
    resources.computingPower = {
      ...resources.computingPower,
      baseProduction, // Базовое производство без модификаторов
      production: totalProduction, // Производство с учётом всех модификаторов
      perSecond: totalProduction // Итоговое производство в секунду
    };
    
    console.log(`ResourceProductionService: Итоговое производство computingPower: ${totalProduction.toFixed(2)} (базовое: ${baseProduction}, множитель: ${productionMultiplier})`);
  }
  
  /**
   * Рассчитывает производство майнинга Bitcoin
   */
  private calculateBitcoinProduction(state: GameState, resources: { [key: string]: any }): void {
    if (!resources.bitcoin || !resources.bitcoin.unlocked) return;
    
    const minerCount = state.buildings.autoMiner?.count || 0;
    const miningEfficiency = state.miningParams?.miningEfficiency || 1.0;
    const bitcoinProduction = 0.00005 * minerCount * miningEfficiency;
    
    resources.bitcoin.perSecond = bitcoinProduction;
    console.log(`ResourceProductionService: Производство Bitcoin: ${bitcoinProduction.toFixed(6)} BTC/сек (${minerCount} майнеров, эффективность: ${miningEfficiency})`);
  }
  
  /**
   * Рассчитывает потребление ресурсов зданиями
   */
  private calculateResourceConsumption(resources: { [key: string]: any }, state: GameState): void {
    // Перебираем все здания и проверяем потребление ресурсов
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count > 0 && building.consumption && building.unlocked) {
        // Для каждого ресурса, потребляемого зданием
        for (const resourceId in building.consumption) {
          const consumptionRate = building.consumption[resourceId];
          const totalConsumption = consumptionRate * building.count;
          
          // Если ресурс существует и разблокирован, вычитаем потребление
          if (resources[resourceId] && resources[resourceId].unlocked) {
            resources[resourceId].perSecond -= totalConsumption;
            console.log(`ResourceProductionService: ${building.name} потребляет ${totalConsumption} ${resourceId}/сек`);
          }
        }
      }
    }
  }
  
  /**
   * Применяет бонусы от специализации к производству ресурсов
   */
  private applySpecializationBonuses(resources: { [key: string]: any }, state: GameState): void {
    if (!state.specialization) return;
    
    console.log(`ResourceProductionService: Применение бонусов специализации '${state.specialization}'`);
    
    // Применяем бонусы в зависимости от специализации
    switch (state.specialization) {
      case 'miner':
        // Бонусы для майнера (вычислительная мощность и BTC)
        if (resources.computingPower) {
          resources.computingPower.perSecond *= 1.25;
        }
        if (resources.bitcoin) {
          resources.bitcoin.perSecond *= 1.40;
        }
        break;
        
      case 'trader':
        // Бонусы для трейдера (USDT)
        if (resources.usdt) {
          resources.usdt.perSecond *= 1.15;
        }
        break;
        
      case 'investor':
        // Бонусы для инвестора (все ресурсы)
        for (const resourceId in resources) {
          if (resources[resourceId].unlocked) {
            resources[resourceId].perSecond *= 1.05;
          }
        }
        break;
        
      case 'analyst':
        // Бонусы для аналитика (знания)
        if (resources.knowledge) {
          resources.knowledge.perSecond *= 1.25;
          console.log(`ResourceProductionService: Бонус аналитика +25% к знаниям применен`);
        }
        break;
        
      case 'influencer':
        // Бонусы для инфлюенсера (все ресурсы)
        for (const resourceId in resources) {
          if (resources[resourceId].unlocked) {
            resources[resourceId].perSecond *= 1.10;
          }
        }
        break;
    }
  }
}
