
import { GameState } from '@/context/types';

/**
 * Сервис для расчета производства и потребления ресурсов
 */
export class ResourceProductionService {
  /**
   * Рассчитывает производство и потребление всех ресурсов
   */
  calculateResourceProduction(state: GameState): any {
    // Создаем копию ресурсов для модификации
    const resources = { ...state.resources };
    
    // Принудительно проверяем разблокировку майнера при наличии исследования "Основы криптовалют"
    this.checkMinerUnlock(state);
    
    // Рассчитываем базовое производство и потребление для каждого ресурса
    for (const resourceId in resources) {
      // Пропускаем неразблокированные ресурсы
      if (!resources[resourceId].unlocked) continue;
      
      let resource = resources[resourceId];
      
      // 1. Проверка специальных случаев для конкретных ресурсов
      switch (resourceId) {
        case 'knowledge':
          // Считаем базовое производство знаний
          let knowledgeProduction = resource.baseProduction || 0;
          
          // Проверяем наличие практики
          if (state.buildings.practice && state.buildings.practice.count > 0) {
            const practiceCount = state.buildings.practice.count;
            const practiceProduction = practiceCount * 1; // 1 знание в секунду за каждую практику
            knowledgeProduction += practiceProduction;
            
            console.log(`ResourceProductionService: Практика добавляет ${practiceProduction.toFixed(2)}/сек знаний`);
          }
          
          // Проверяем наличие исследования "Основы блокчейна" для бонуса к производству знаний
          const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                                     state.upgrades.basicBlockchain?.purchased || 
                                     state.upgrades.blockchain_basics?.purchased;
          
          // Если есть исследование, увеличиваем производство на 10%
          if (hasBlockchainBasics) {
            const bonus = knowledgeProduction * 0.1; // +10% бонус
            knowledgeProduction += bonus;
            console.log(`ResourceProductionService: "Основы блокчейна" добавляют ${bonus.toFixed(2)}/сек знаний (+10%)`);
          }
          
          console.log(`ResourceProductionService: скорость производства знаний=${knowledgeProduction.toFixed(2)}/сек`);
          
          resources[resourceId] = {
            ...resource,
            production: knowledgeProduction,
            perSecond: knowledgeProduction
          };
          break;
        
        case 'usdt':
          // USDT базовое производство (если есть)
          const usdtProduction = resource.baseProduction || 0;
          
          resources[resourceId] = {
            ...resource,
            production: usdtProduction,
            perSecond: usdtProduction
          };
          break;
        
        case 'electricity':
          // Электричество от генераторов
          let electricityProduction = resource.baseProduction || 0;
          
          if (state.buildings.generator && state.buildings.generator.count > 0) {
            const generatorCount = state.buildings.generator.count;
            const generatorProduction = generatorCount * 0.5; // 0.5 электричества в секунду за генератор
            electricityProduction += generatorProduction;
            
            console.log(`ResourceProductionService: Генераторы добавляют ${generatorProduction.toFixed(2)}/сек электричества`);
          }
          
          // Потребление электричества (домашний компьютер и др.)
          let electricityConsumption = 0;
          
          if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
            const computerCount = state.buildings.homeComputer.count;
            const computerConsumption = computerCount * 1; // 1 электричество в секунду на компьютер
            electricityConsumption += computerConsumption;
            
            console.log(`ResourceProductionService: Домашние компьютеры потребляют ${computerConsumption.toFixed(2)}/сек электричества`);
          }
          
          if (state.buildings.miner && state.buildings.miner.count > 0) {
            const minerCount = state.buildings.miner.count;
            const minerConsumption = minerCount * 1; // 1 электричество в секунду на майнер
            electricityConsumption += minerConsumption;
            
            console.log(`ResourceProductionService: Майнеры потребляют ${minerConsumption.toFixed(2)}/сек электричества`);
          }
          
          // Считаем итоговое производство электричества
          const netElectricityProduction = electricityProduction - electricityConsumption;
          
          resources[resourceId] = {
            ...resource,
            production: electricityProduction,
            consumption: electricityConsumption,
            perSecond: netElectricityProduction
          };
          break;
          
        case 'computingPower':
          // Вычислительная мощность от домашних компьютеров
          let computingProduction = resource.baseProduction || 0;
          
          if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
            const computerCount = state.buildings.homeComputer.count;
            const computerProduction = computerCount * 2; // 2 вычисл. мощности в секунду на компьютер
            computingProduction += computerProduction;
            
            console.log(`ResourceProductionService: Домашние компьютеры производят ${computerProduction.toFixed(2)}/сек вычислительной мощности`);
          }
          
          // Потребление вычислительной мощности (майнеры и др.)
          let computingConsumption = 0;
          
          if (state.buildings.miner && state.buildings.miner.count > 0) {
            const minerCount = state.buildings.miner.count;
            const minerConsumption = minerCount * 5; // 5 вычисл. мощности в секунду на майнер
            computingConsumption += minerConsumption;
            
            console.log(`ResourceProductionService: Майнеры потребляют ${minerConsumption.toFixed(2)}/сек вычислительной мощности`);
          }
          
          // Считаем итоговую вычислительную мощность
          const netComputingProduction = computingProduction - computingConsumption;
          
          resources[resourceId] = {
            ...resource,
            production: computingProduction,
            consumption: computingConsumption,
            perSecond: netComputingProduction
          };
          break;
          
        case 'bitcoin':
          // Биткоин от майнеров
          let bitcoinProduction = resource.baseProduction || 0;
          
          if (state.buildings.miner && state.buildings.miner.count > 0) {
            const minerCount = state.buildings.miner.count;
            // Базовое производство: 0.00005 BTC в секунду на майнер
            let miningEfficiency = state.miningParams?.miningEfficiency || 1;
            const minerProduction = minerCount * 0.00005 * miningEfficiency;
            bitcoinProduction += minerProduction;
            
            console.log(`ResourceProductionService: Майнеры производят ${minerProduction.toFixed(6)}/сек Bitcoin (эффективность: ${miningEfficiency})`);
          }
          
          resources[resourceId] = {
            ...resource,
            production: bitcoinProduction,
            perSecond: bitcoinProduction
          };
          break;
          
        default:
          resources[resourceId] = {
            ...resource,
            production: resource.baseProduction || 0,
            perSecond: resource.baseProduction || 0
          };
      }
    }
    
    return resources;
  }
  
  /**
   * Принудительно проверяет разблокировку майнера при наличии исследования "Основы криптовалют"
   */
  private checkMinerUnlock(state: GameState): void {
    // Проверяем, куплено ли исследование "Основы криптовалют"
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
      (state.upgrades.cryptoBasics?.purchased === true);
    
    if (hasCryptoBasics) {
      console.log("ResourceProductionService: Обнаружено исследование 'Основы криптовалют', проверяем разблокировку майнера");
      
      // Проверяем, разблокирован ли майнер
      const isMinerUnlocked = 
        (state.buildings.miner?.unlocked === true) || 
        (state.buildings.autoMiner?.unlocked === true);
      
      if (!isMinerUnlocked) {
        console.warn("ResourceProductionService: Майнер не разблокирован, хотя исследование 'Основы криптовалют' куплено!");
      }
      
      // Проверяем, разблокирован ли Bitcoin
      if (!state.resources.bitcoin?.unlocked) {
        console.warn("ResourceProductionService: Bitcoin не разблокирован, хотя исследование 'Основы криптовалют' куплено!");
      }
    }
  }
}
