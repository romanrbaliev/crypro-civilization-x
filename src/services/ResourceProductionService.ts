import { GameState } from '@/context/types';

/**
 * Сервис для расчета производства и потребления ресурсов
 */
export class ResourceProductionService {
  
  /**
   * Рассчитывает производство и потребление ресурсов
   * @param state - Текущее состояние игры
   * @returns Обновленные ресурсы с установленными значениями производства
   */
  public calculateResourceProduction(state: GameState): { [key: string]: any } {
    const updatedResources = JSON.parse(JSON.stringify(state.resources));
    
    // Сбрасываем значения производства для всех ресурсов
    for (const resourceId in updatedResources) {
      if (updatedResources[resourceId].unlocked) {
        updatedResources[resourceId].perSecond = 0;
      }
    }
    
    // Расчет базового производства знаний для практики (1.0 на 1 уровень практики)
    if (state.buildings.practice && state.buildings.practice.count > 0) {
      const practiceCount = state.buildings.practice.count;
      
      // Базовое производство от здания "Практика" - 1 знание в секунду для одной практики
      const baseKnowledgeProduction = 1.0 * practiceCount;
      
      // Проверка наличия исследований, улучшающих практику
      const blockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                               state.upgrades.basicBlockchain?.purchased || 
                               state.upgrades.blockchain_basics?.purchased;
                               
      // Если есть исследования, увеличиваем эффективность
      let knowledgeMultiplier = 1.0;
      if (blockchainBasics) {
        knowledgeMultiplier += 0.1; // +10% от исследования "Основы блокчейна"
      }
      
      // Финальное производство знаний от практики
      const finalKnowledgeProduction = baseKnowledgeProduction * knowledgeMultiplier;
      
      // Если ресурс существует, добавляем производство
      if (updatedResources.knowledge) {
        updatedResources.knowledge.perSecond += finalKnowledgeProduction;
        console.log(`ResourceProductionService: Итоговое производство knowledge: ${finalKnowledgeProduction.toFixed(2)} (базовое: ${baseKnowledgeProduction}, множитель: ${knowledgeMultiplier})`);
      }
    }
    
    // Расчет производства электричества от генераторов
    if (state.buildings.generator && state.buildings.generator.count > 0) {
      const generatorCount = state.buildings.generator.count;
      const baseElectricityProduction = 0.5 * generatorCount; // 0.5 электричества в секунду на 1 генератор
      
      if (updatedResources.electricity) {
        updatedResources.electricity.perSecond += baseElectricityProduction;
        console.log(`ResourceProductionService: Базовое производство электричества: ${baseElectricityProduction} (${generatorCount} × 0.5)`);
      }
    }
    
    // Расчет производства от автомайнеров
    if (state.buildings.autoMiner && state.buildings.autoMiner.count > 0 && updatedResources.bitcoin) {
      const minerCount = state.buildings.autoMiner.count;
      const miningEfficiency = state.miningParams?.miningEfficiency || 1.0;
      const bitcoinProduction = 0.00005 * minerCount * miningEfficiency;
      
      updatedResources.bitcoin.perSecond = bitcoinProduction;
      console.log(`ResourceProductionService: Производство Bitcoin: ${bitcoinProduction.toFixed(6)} BTC/сек (${minerCount} майнеров, эффективность: ${miningEfficiency})`);
    }
    
    // Расчет потребления ресурсов зданиями
    this.calculateResourceConsumption(updatedResources, state);
    
    // Применение бонусов специализации
    this.applySpecializationBonuses(updatedResources, state);
    
    return updatedResources;
  }
  
  /**
   * Рассчитывает потребление ресурсов зданиями
   */
  private calculateResourceConsumption(resources: { [key: string]: any }, state: GameState): void {
    // Перебираем все здания и проверяем потребление ресурсов
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      
      if (building.count > 0 && building.consumption) {
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
