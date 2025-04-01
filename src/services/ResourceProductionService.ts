
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
      
      // Если есть майнер и он активен, начисляем bitcoin
      if (state.buildings.autoMiner && state.buildings.autoMiner.count > 0 && 
          state.buildings.autoMiner.unlocked && updatedResources.bitcoin) {
        
        // Проверяем наличие необходимых ресурсов
        const hasElectricity = 
          updatedResources.electricity && 
          updatedResources.electricity.value >= state.buildings.autoMiner.count;
        
        const hasComputingPower = 
          updatedResources.computingPower && 
          updatedResources.computingPower.value >= state.buildings.autoMiner.count * 5;
        
        if (hasElectricity && hasComputingPower) {
          // Базовая скорость майнинга
          const baseMiningRate = 0.00005;
          // Количество майнеров
          const minerCount = state.buildings.autoMiner.count;
          // Эффективность майнинга из параметров
          const miningEfficiency = state.miningParams?.miningEfficiency || 1;
          
          // Рассчитываем итоговую скорость майнинга с учетом эффективности
          const bitcoinPerSecond = baseMiningRate * minerCount * miningEfficiency;
          
          // Обновляем скорость майнинга Bitcoin
          updatedResources.bitcoin.perSecond = bitcoinPerSecond;
          
          // Обновляем потребление ресурсов майнерами
          updatedResources.electricity.perSecond -= minerCount;
          updatedResources.computingPower.perSecond -= minerCount * 5;
          
          console.log(`ResourceProductionService: майнинг Bitcoin=${bitcoinPerSecond.toFixed(6)}/сек`);
        } else {
          // Если недостаточно ресурсов, устанавливаем нулевую скорость
          updatedResources.bitcoin.perSecond = 0;
        }
      }
      
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
    // Сначала рассчитаем базовое производство от всех зданий
    for (const buildingId in buildings) {
      const building = buildings[buildingId];
      
      // Пропускаем неразблокированные здания и здания с количеством 0
      if (!building.unlocked || !building.count || building.count <= 0) {
        continue;
      }
      
      // Для каждого ресурса, который производит здание
      const production = building.production || {};
      for (const resourceId in production) {
        // Пропускаем эффекты влияющие на максимум
        if (resourceId.includes('Max')) continue;
        
        if (resources[resourceId] && resources[resourceId].unlocked) {
          // Рассчитываем базовое производство
          const productionAmount = Number(production[resourceId]) * building.count;
          
          // Увеличиваем базовое производство ресурса
          resources[resourceId].production += productionAmount;
          
          // Также устанавливаем базовое значение производства, если его еще нет
          if (resources[resourceId].baseProduction === undefined) {
            resources[resourceId].baseProduction = 0;
          }
          
          resources[resourceId].baseProduction += productionAmount;
          
          console.log(`ResourceProductionService: ${building.name} (${building.count} шт.) производит ${productionAmount} ${resourceId}/сек`);
        }
      }
    }
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
        }
      } catch (error) {
        console.error('ResourceProductionService: Ошибка при расчете бонусов от исследований', error);
      }
      
      // Бонусы от зданий
      try {
        if (resourceId === 'knowledge') {
          // Интернет-канал: +20% к скорости получения знаний за каждый
          if (state.buildings.internetConnection && 
              state.buildings.internetConnection.count > 0 && 
              state.buildings.internetConnection.unlocked) {
            const internetConnectionCount = state.buildings.internetConnection.count;
            const internetBonus = 0.2 * internetConnectionCount;
            totalBonus += internetBonus;
            bonusDetails.push(`Интернет-канал (${internetConnectionCount} шт.): +${(internetBonus * 100).toFixed(0)}%`);
          }
        }
        
        // Другие бонусы от зданий могут быть добавлены здесь
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
