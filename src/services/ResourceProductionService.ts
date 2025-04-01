
import { GameState, Resource, Building, SpecializationSynergy } from '@/context/types';
import { BonusCalculationService } from './BonusCalculationService';

/**
 * Сервис для расчета производства ресурсов и применения бонусов
 */
export class ResourceProductionService {
  private bonusCalculationService: BonusCalculationService;
  
  constructor() {
    this.bonusCalculationService = new BonusCalculationService();
  }
  
  /**
   * Рассчитывает производство всех ресурсов и возвращает обновленное состояние ресурсов
   */
  calculateResourceProduction(state: GameState): { [key: string]: Resource } {
    try {
      // Создаем глубокую копию ресурсов для предотвращения мутаций
      const updatedResources = JSON.parse(JSON.stringify(state.resources));
      
      // Устанавливаем базовую скорость производства для всех ресурсов от зданий
      for (const resourceId in updatedResources) {
        // Сбрасываем производство и скорость в секунду перед расчетом
        updatedResources[resourceId].perSecond = 0;
        updatedResources[resourceId].production = 0;
      }
      
      // Рассчитываем базовое производство от зданий
      this.calculateBuildingProduction(updatedResources, state.buildings);
      
      // Рассчитываем бонусы и умножители для каждого ресурса
      for (const resourceId in updatedResources) {
        const resource = updatedResources[resourceId];
        if (!resource.unlocked) continue;
        
        // Получаем все бонусы для этого ресурса
        const productionBonus = this.calculateResourceProductionBonus(state, resourceId);
        
        // Логируем детали расчета для отладки
        if (resourceId === 'knowledge') {
          console.log(`ResourceProductionService: базовое производство знаний=${resource.production}`);
          console.log(`ResourceProductionService: бонус производства знаний=${productionBonus.toFixed(2)}`);
          console.log(`ResourceProductionService: скорость производства знаний=${(resource.production * productionBonus).toFixed(2)}/сек`);
        }
        
        // Применяем все бонусы к базовому производству
        resource.perSecond = resource.production * productionBonus;
      }
      
      // Особый расчет для майнинга Bitcoin
      this.calculateBitcoinMining(updatedResources, state);
      
      return updatedResources;
    } catch (error) {
      console.error("ResourceProductionService: Ошибка при расчете производства", error);
      return state.resources;
    }
  }
  
  /**
   * Рассчитывает базовое производство ресурсов от всех зданий
   */
  private calculateBuildingProduction(
    resources: { [key: string]: Resource },
    buildings: { [key: string]: Building }
  ): void {
    // Обрабатываем стандартные генераторы ресурсов
    Object.values(buildings).forEach(building => {
      if (!building.unlocked || building.count <= 0) return;
      
      // Обрабатываем здания с заданным производством
      switch (building.id) {
        case 'practice':
          // Практика: +1 знание/сек за каждое здание
          if (resources.knowledge) {
            resources.knowledge.production += building.count;
            resources.knowledge.baseProduction = (resources.knowledge.baseProduction || 0) + building.count;
          }
          break;
          
        case 'generator':
          // Генератор: +0.5 электричества/сек за каждый генератор
          if (resources.electricity) {
            const electricityProduction = 0.5 * building.count;
            resources.electricity.production += electricityProduction;
            resources.electricity.baseProduction = (resources.electricity.baseProduction || 0) + electricityProduction;
          }
          break;
          
        case 'homeComputer':
          // Домашний компьютер: +2 вычисл. мощности/сек за каждый компьютер
          // Расход 1 электр./сек за каждый компьютер
          if (resources.computingPower) {
            const cpuProduction = 2 * building.count;
            resources.computingPower.production += cpuProduction;
            resources.computingPower.baseProduction = (resources.computingPower.baseProduction || 0) + cpuProduction;
          }
          
          if (resources.electricity) {
            resources.electricity.perSecond -= building.count; // Расход электричества
          }
          break;
      }
    });
  }
  
  /**
   * Особый расчет для майнинга Bitcoin
   */
  private calculateBitcoinMining(
    resources: { [key: string]: Resource },
    state: GameState
  ): void {
    // Проверяем наличие майнера/автомайнера
    const miner = state.buildings.miner || state.buildings.autoMiner;
    if (!miner || miner.count <= 0 || !miner.unlocked || !resources.bitcoin) {
      return;
    }
    
    // Проверяем наличие необходимых ресурсов
    const hasElectricity = 
      resources.electricity && 
      resources.electricity.value >= miner.count;
    
    const hasComputingPower = 
      resources.computingPower && 
      resources.computingPower.value >= miner.count * 5;
    
    if (hasElectricity && hasComputingPower) {
      // Базовая скорость майнинга
      const baseMiningRate = 0.00005;
      // Количество майнеров
      const minerCount = miner.count;
      // Эффективность майнинга из параметров
      const miningEfficiency = state.miningParams?.miningEfficiency || 1;
      
      // Рассчитываем итоговую скорость майнинга с учетом эффективности
      const bitcoinPerSecond = baseMiningRate * minerCount * miningEfficiency;
      
      // Обновляем скорость майнинга Bitcoin
      resources.bitcoin.perSecond = bitcoinPerSecond;
      
      // Расчет потребления ресурсов с учетом энергоэффективности
      const energyEfficiency = state.miningParams?.energyEfficiency || 0;
      const coolingSystemEffect = this.calculateCoolingSystemEffect(state);
      
      // Базовый расход электричества с учетом эффективности
      const electricityConsumption = minerCount * (1 - energyEfficiency);
      // Базовый расход вычислительной мощности с учетом системы охлаждения
      const computingPowerConsumption = minerCount * 5 * (1 - coolingSystemEffect);
      
      // Обновляем потребление ресурсов майнерами
      resources.electricity.perSecond -= electricityConsumption;
      resources.computingPower.perSecond -= computingPowerConsumption;
      
      console.log(`ResourceProductionService: майнинг Bitcoin=${bitcoinPerSecond.toFixed(6)}/сек`);
      console.log(`ResourceProductionService: потребление электричества=${electricityConsumption.toFixed(2)}/сек`);
      console.log(`ResourceProductionService: потребление выч.мощности=${computingPowerConsumption.toFixed(2)}/сек`);
    } else {
      // Если недостаточно ресурсов, устанавливаем нулевую скорость
      resources.bitcoin.perSecond = 0;
    }
  }
  
  /**
   * Рассчитывает эффект от системы охлаждения
   */
  private calculateCoolingSystemEffect(state: GameState): number {
    const coolingSystem = state.buildings.coolingSystem;
    if (!coolingSystem || coolingSystem.count <= 0) {
      return 0;
    }
    
    // -20% к потреблению вычислительной мощности за каждую систему охлаждения
    // (но не более 90%)
    const reductionPerSystem = 0.2;
    const totalReduction = Math.min(0.9, reductionPerSystem * coolingSystem.count);
    
    return totalReduction;
  }
  
  /**
   * Рассчитывает бонус производства для указанного ресурса
   */
  private calculateResourceProductionBonus(state: GameState, resourceId: string): number {
    try {
      // Начинаем с бонуса 100% (множитель 1.0)
      let totalBonus = 1.0;
      const bonusDetails = [];
      
      // Собираем бонусы от исследований
      try {
        // Для знаний: проверяем "Основы блокчейна"
        if (resourceId === 'knowledge') {
          const blockchainBasicsPurchased = 
            (state.upgrades.blockchainBasics?.purchased) ||
            (state.upgrades.basicBlockchain?.purchased) ||
            (state.upgrades.blockchain_basics?.purchased);
          
          if (blockchainBasicsPurchased) {
            // Основы блокчейна дают +10% к скорости получения знаний
            totalBonus += 0.1;
            bonusDetails.push(`Основы блокчейна: +10%`);
          }
          
          // Проверяем другие исследования, влияющие на знания
          Object.values(state.upgrades)
            .filter(upgrade => upgrade.purchased && upgrade.effects)
            .forEach(upgrade => {
              if (upgrade.effects.knowledgeBoost) {
                totalBonus += upgrade.effects.knowledgeBoost;
                bonusDetails.push(`${upgrade.name}: +${(upgrade.effects.knowledgeBoost * 100).toFixed(0)}%`);
              }
            });
        }
      } catch (error) {
        console.error('ResourceProductionService: Ошибка при расчете бонусов от исследований', error);
      }
      
      // Бонусы от зданий
      try {
        if (resourceId === 'knowledge') {
          // Интернет-канал: +20% к скорости получения знаний за каждый
          if (state.buildings.internetChannel && 
              state.buildings.internetChannel.count > 0 && 
              state.buildings.internetChannel.unlocked) {
            const internetChannelCount = state.buildings.internetChannel.count;
            const internetBonus = 0.2 * internetChannelCount;
            totalBonus += internetBonus;
            bonusDetails.push(`Интернет-канал (${internetChannelCount} шт.): +${(internetBonus * 100).toFixed(0)}%`);
          }
          
          // Криптобиблиотека: +50% к скорости получения знаний за каждую
          if (state.buildings.cryptoLibrary && 
              state.buildings.cryptoLibrary.count > 0 && 
              state.buildings.cryptoLibrary.unlocked) {
            const cryptoLibraryCount = state.buildings.cryptoLibrary.count;
            const libraryBonus = 0.5 * cryptoLibraryCount;
            totalBonus += libraryBonus;
            bonusDetails.push(`Криптобиблиотека (${cryptoLibraryCount} шт.): +${(libraryBonus * 100).toFixed(0)}%`);
          }
        }
        
        if (resourceId === 'computingPower') {
          // Интернет-канал: +5% к эффективности производства вычисл. мощности за каждый
          if (state.buildings.internetChannel && 
              state.buildings.internetChannel.count > 0 && 
              state.buildings.internetChannel.unlocked) {
            const internetChannelCount = state.buildings.internetChannel.count;
            const cpuBonus = 0.05 * internetChannelCount;
            totalBonus += cpuBonus;
            bonusDetails.push(`Интернет-канал (${internetChannelCount} шт.): +${(cpuBonus * 100).toFixed(0)}%`);
          }
        }
      } catch (error) {
        console.error('ResourceProductionService: Ошибка при расчете бонусов от зданий', error);
      }
      
      // Бонусы от специализации
      try {
        if (resourceId === 'knowledge') {
          // Аналитик: +25% к знаниям
          if (state.specialization === 'analyst') {
            totalBonus += 0.25;
            bonusDetails.push(`Специализация Аналитик: +25%`);
          } 
          // Инфлюенсер: +10% к знаниям
          else if (state.specialization === 'influencer') {
            totalBonus += 0.1;
            bonusDetails.push(`Специализация Инфлюенсер: +10%`);
          }
        }
        
        if (resourceId === 'bitcoin') {
          // Майнер: +25% к эффективности майнинга
          if (state.specialization === 'miner') {
            totalBonus += 0.25;
            bonusDetails.push(`Специализация Майнер: +25%`);
          }
        }
      } catch (error) {
        console.error('ResourceProductionService: Ошибка при расчете бонусов от специализации', error);
      }
      
      // Бонусы от помощников и рефералов
      try {
        // Бонус от активных рефералов: +5% за каждого
        const activeReferrals = state.referrals 
          ? Object.values(state.referrals).filter(ref => ref.active).length 
          : 0;
        
        if (activeReferrals > 0) {
          const referralBonus = activeReferrals * 0.05;
          totalBonus += referralBonus;
          bonusDetails.push(`Активные рефералы (${activeReferrals} шт.): +${(referralBonus * 100).toFixed(0)}%`);
        }
        
        // Бонус от помощников на практике: +15% за каждого
        if (resourceId === 'knowledge') {
          const helpers = state.referralHelpers || {};
          let helperBonus = 0;
          let activeHelpers = 0;
          
          for (const helperId in helpers) {
            const helper = helpers[helperId];
            if (helper.status === 'active' && helper.buildingId === 'practice') {
              helperBonus += 0.15;
              activeHelpers++;
            }
          }
          
          if (activeHelpers > 0) {
            totalBonus += helperBonus;
            bonusDetails.push(`Помощники на практике (${activeHelpers} шт.): +${(helperBonus * 100).toFixed(0)}%`);
          }
        }
      } catch (error) {
        console.error('ResourceProductionService: Ошибка при расчете бонусов от рефералов и помощников', error);
      }
      
      // Логируем итоговый бонус для знаний
      if (resourceId === 'knowledge') {
        console.log(`ResourceProductionService: Расчет бонусов для knowledge:`);
        bonusDetails.forEach(detail => console.log(`- ${detail}`));
        console.log(`ResourceProductionService: Итоговый множитель для knowledge: ${totalBonus.toFixed(2)}`);
      }
      
      return totalBonus;
    } catch (error) {
      console.error(`ResourceProductionService: Ошибка при расчете бонуса для ${resourceId}`, error);
      return 1.0; // В случае ошибки возвращаем множитель 1 (без бонусов)
    }
  }
}
