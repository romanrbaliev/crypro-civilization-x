
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
    
    // Проверяем, какие ресурсы закончились или недоступны
    const resourcesExhausted = this.checkExhaustedResources(state);
    const resourcesUnavailable = this.checkUnavailableResources(state);
    
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
          
          // ИСПРАВЛЕНИЕ: Применяем бонус от исследования "Основы блокчейна" ТОЛЬКО ОДИН РАЗ
          // Проверяем наличие исследования "Основы блокчейна" для бонуса к производству знаний
          const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                                     state.upgrades.basicBlockchain?.purchased || 
                                     state.upgrades.blockchain_basics?.purchased;
          
          // Если есть исследование, увеличиваем производство на 10%
          if (hasBlockchainBasics) {
            // Проверим, что изначальное производство больше 0, чтобы избежать лишних бонусов при нуле
            if (knowledgeProduction > 0) {
              // Находим базовое значение и применяем только один раз бонус
              const bonus = knowledgeProduction * 0.1; // +10% бонус
              knowledgeProduction += bonus;
              console.log(`ResourceProductionService: "Основы блокчейна" добавляют ${bonus.toFixed(2)}/сек знаний (+10%)`);
            }
          }
          
          // Проверяем наличие интернет-канала для бонуса к производству знаний
          if (state.buildings.internetChannel && state.buildings.internetChannel.count > 0) {
            const internetChannelCount = state.buildings.internetChannel.count;
            // Увеличиваем скорость получения знаний на 20% за каждый интернет-канал
            const internetBonus = knowledgeProduction * 0.2 * internetChannelCount;
            knowledgeProduction += internetBonus;
            
            console.log(`ResourceProductionService: Интернет-канал добавляет ${internetBonus.toFixed(2)}/сек знаний (+20% за каждый канал)`);
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
          
          // Проверяем, не закончилось ли электричество
          const isElectricityExhausted = resourcesExhausted.includes('electricity');
          
          if (!isElectricityExhausted) {
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
          } else {
            console.log('ResourceProductionService: Электричество закончилось, потребление приостановлено');
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
          
          // Проверяем, не закончилось ли электричество
          const isElectricityAvailable = !resourcesExhausted.includes('electricity');
          
          if (isElectricityAvailable && state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
            const computerCount = state.buildings.homeComputer.count;
            let computerProduction = computerCount * 2; // 2 вычисл. мощности в секунду на компьютер
            
            // Проверяем наличие интернет-канала для бонуса к вычислительной мощности
            if (state.buildings.internetChannel && state.buildings.internetChannel.count > 0) {
              // +5% к эффективности вычислительной мощности за каждый интернет-канал
              const internetChannelCount = state.buildings.internetChannel.count;
              const internetBonus = computerProduction * 0.05 * internetChannelCount;
              computerProduction += internetBonus;
              
              console.log(`ResourceProductionService: Интернет-канал увеличивает производство вычисл. мощности на ${internetBonus.toFixed(2)} (+5% за каждый канал)`);
            }
            
            computingProduction += computerProduction;
            console.log(`ResourceProductionService: Домашние компьютеры производят ${computerProduction.toFixed(2)}/сек вычислительной мощности`);
          } else if (!isElectricityAvailable) {
            console.log('ResourceProductionService: Электричество закончилось, производство вычислительной мощности приостановлено');
          }
          
          // Потребление вычислительной мощности (майнеры и др.)
          let computingConsumption = 0;
          
          // Проверяем, не закончилась ли вычислительная мощность
          const isComputingPowerExhausted = resourcesExhausted.includes('computingPower');
          
          if (!isComputingPowerExhausted && !resourcesExhausted.includes('electricity')) {
            if (state.buildings.miner && state.buildings.miner.count > 0) {
              const minerCount = state.buildings.miner.count;
              const minerConsumption = minerCount * 5; // 5 вычисл. мощности в секунду на майнер
              computingConsumption += minerConsumption;
              
              console.log(`ResourceProductionService: Майнеры потребляют ${minerConsumption.toFixed(2)}/сек вычислительной мощности`);
            }
          } else if (isComputingPowerExhausted) {
            console.log('ResourceProductionService: Вычислительная мощность закончилась, потребление приостановлено');
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
          
          // ИСПРАВЛЕНО: Проверяем и недоступность ресурса computingPower, не только его нехватку
          // Проверяем, не закончилось ли электричество или вычислительная мощность
          const isElectricityResourceAvailable = !resourcesExhausted.includes('electricity') && 
                                                !resourcesUnavailable.includes('electricity');
          const isComputingPowerResourceAvailable = !resourcesExhausted.includes('computingPower') && 
                                                   !resourcesUnavailable.includes('computingPower');
          
          // Для производства биткоина нужны и электричество, и вычислительная мощность
          const resourcesAvailableForMining = isElectricityResourceAvailable && isComputingPowerResourceAvailable;
          
          if (resourcesAvailableForMining && state.buildings.miner && state.buildings.miner.count > 0) {
            const minerCount = state.buildings.miner.count;
            // Базовое производство: 0.00005 BTC в секунду на майнер
            let miningEfficiency = state.miningParams?.miningEfficiency || 1;
            const minerProduction = minerCount * 0.00005 * miningEfficiency;
            bitcoinProduction += minerProduction;
            
            console.log(`ResourceProductionService: Майнеры производят ${minerProduction.toFixed(6)}/сек Bitcoin (эффективность: ${miningEfficiency})`);
          } else {
            // Логируем точную причину остановки майнинга
            if (!isElectricityResourceAvailable) {
              console.log('ResourceProductionService: Недостаточно электричества для майнинга Bitcoin');
            }
            if (!isComputingPowerResourceAvailable) {
              console.log('ResourceProductionService: Недостаточно вычислительной мощности для майнинга Bitcoin');
            }
            if (!state.buildings.miner || state.buildings.miner.count === 0) {
              console.log('ResourceProductionService: Нет доступных майнеров для производства Bitcoin');
            }
            
            // Устанавливаем производство в ноль
            bitcoinProduction = 0;
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
   * Проверяет, какие ресурсы закончились (их значение равно 0)
   */
  private checkExhaustedResources(state: GameState): string[] {
    const exhaustedResources: string[] = [];
    
    for (const resourceId in state.resources) {
      const resource = state.resources[resourceId];
      if (resource.unlocked && resource.value <= 0 && resource.perSecond < 0) {
        exhaustedResources.push(resourceId);
        console.log(`ResourceProductionService: Ресурс ${resourceId} закончился`);
      }
    }
    
    return exhaustedResources;
  }
  
  /**
   * Проверяет, какие требуемые ресурсы недоступны (еще не разблокированы)
   * Добавлен новый метод для проверки недоступных ресурсов
   */
  private checkUnavailableResources(state: GameState): string[] {
    const unavailableResources: string[] = [];
    
    // Список всех возможных ресурсов
    const requiredResources = ['electricity', 'computingPower', 'bitcoin'];
    
    for (const resourceId of requiredResources) {
      // Ресурс считается недоступным, если он не существует или не разблокирован
      if (!state.resources[resourceId] || !state.resources[resourceId].unlocked) {
        unavailableResources.push(resourceId);
        console.log(`ResourceProductionService: Ресурс ${resourceId} недоступен (не разблокирован)`);
      }
    }
    
    return unavailableResources;
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
