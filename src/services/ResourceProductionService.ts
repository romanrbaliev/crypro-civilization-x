
import { GameState } from '@/context/types';
import { BonusCalculationService } from './BonusCalculationService';

/**
 * Сервис для расчёта производства ресурсов на основе зданий, улучшений и бонусов
 */
export class ResourceProductionService {
  private bonusCalculationService: BonusCalculationService;

  constructor() {
    this.bonusCalculationService = new BonusCalculationService();
  }

  /**
   * Пересчитывает все ресурсы и возвращает обновленное состояние ресурсов
   */
  calculateResourceProduction(state: GameState): { [key: string]: any } {
    console.log("ResourceProductionService: Расчет производства ресурсов");
    
    // Создаем копию ресурсов для изменения
    const updatedResources = { ...state.resources };
    
    // Сбрасываем значения производства для всех ресурсов
    this.resetResourceProduction(updatedResources);
    
    // Производство от зданий с учетом их количества
    this.calculateBuildingProduction(state, updatedResources);
    
    // Обработка базового производства от улучшений
    this.calculateBaseProduction(state, updatedResources);
    
    // Проверка на наличие и состояние критических ресурсов (знания, USDT)
    this.ensureCriticalResources(state, updatedResources);
    
    // Применение заключительных бонусов и множителей
    this.applyFinalBonuses(state, updatedResources);
    
    return updatedResources;
  }

  /**
   * Сбрасывает значения производства для всех ресурсов
   */
  private resetResourceProduction(resources: { [key: string]: any }): void {
    for (const resourceId in resources) {
      const resource = resources[resourceId];
      if (resource) {
        // Обнуляем производство и perSecond, но сохраняем baseProduction
        resource.production = 0;
        resource.perSecond = 0;
        // НЕ сбрасываем baseProduction, так как оно устанавливается отдельно
      }
    }
  }

  /**
   * Рассчитывает производство ресурсов от зданий
   */
  private calculateBuildingProduction(state: GameState, resources: { [key: string]: any }): void {
    const { buildings } = state;
    
    // Проходим по всем зданиям и добавляем их вклад в производство соответствующих ресурсов
    for (const buildingId in buildings) {
      const building = buildings[buildingId];
      
      if (building && building.count > 0 && building.unlocked) {
        // Обработка производства от каждого типа здания
        switch (buildingId) {
          case 'practice': {
            // Практика производит знания
            if (resources.knowledge) {
              // ИСПРАВЛЕНО: Практика дает строго 1 знание в секунду за каждый уровень
              // согласно таблице разблокировки контента
              const practiceCount = building.count;
              const knowledgePerPractice = 1; // Исправлено с 0.21 на 1
              const totalKnowledgeFromPractice = practiceCount * knowledgePerPractice;
              
              // Добавляем производство к базовому
              resources.knowledge.production += totalKnowledgeFromPractice;
              
              console.log(`ResourceProductionService: Производство знаний от практики: ${totalKnowledgeFromPractice.toFixed(2)}`);
            }
            break;
          }
          
          case 'generator': {
            // Генератор производит электричество
            if (resources.electricity) {
              // ИСПРАВЛЕНО: Генератор дает строго 0.5 электричества в секунду за каждый уровень
              const generatorCount = building.count;
              const electricityPerGenerator = 0.5;
              const totalElectricityFromGenerators = generatorCount * electricityPerGenerator;
              
              // Добавляем производство к базовому
              resources.electricity.production += totalElectricityFromGenerators;
              
              console.log(`ResourceProductionService: Производство электричества от генераторов: ${totalElectricityFromGenerators.toFixed(2)}`);
            }
            break;
          }
          
          case 'homeComputer': {
            // Домашний компьютер производит вычислительную мощность
            if (resources.computingPower && resources.electricity) {
              // ИСПРАВЛЕНО: Компьютер дает строго 2 вычисл. мощности в секунду и потребляет 1 электричества
              const computerCount = building.count;
              const powerPerComputer = 2;
              const totalPowerFromComputers = computerCount * powerPerComputer;
              
              // Добавляем производство к базовому
              resources.computingPower.production += totalPowerFromComputers;
              
              // Потребление электричества компьютерами
              const electricityPerComputer = 1;
              const totalElectricityConsumption = computerCount * electricityPerComputer;
              
              // Вычитаем потребление из производства электричества
              resources.electricity.production -= totalElectricityConsumption;
              
              console.log(`ResourceProductionService: Производство вычислительной мощности: ${totalPowerFromComputers.toFixed(2)}`);
              console.log(`ResourceProductionService: Потребление электричества компьютерами: ${totalElectricityConsumption.toFixed(2)}`);
            }
            break;
          }
          
          case 'autoMiner': {
            // Автомайнер производит Bitcoin, но потребляет электричество и вычисл. мощность
            if (resources.bitcoin && resources.electricity && resources.computingPower) {
              // ИСПРАВЛЕНО: Майнер производит 0.00005 Bitcoin за каждый уровень
              const minerCount = building.count;
              const bitcoinPerMiner = 0.00005;
              const miningEfficiency = state.miningParams?.miningEfficiency || 1;
              
              // Применяем эффективность майнинга
              const totalBitcoinFromMiners = minerCount * bitcoinPerMiner * miningEfficiency;
              
              // Добавляем производство Bitcoin
              resources.bitcoin.production += totalBitcoinFromMiners;
              
              // Потребление ресурсов автомайнерами
              const electricityPerMiner = 1;
              const computingPowerPerMiner = 5;
              
              const totalElectricityConsumption = minerCount * electricityPerMiner;
              const totalComputingPowerConsumption = minerCount * computingPowerPerMiner;
              
              // Вычитаем потребление
              resources.electricity.production -= totalElectricityConsumption;
              resources.computingPower.production -= totalComputingPowerConsumption;
              
              console.log(`ResourceProductionService: Производство Bitcoin: ${totalBitcoinFromMiners.toFixed(8)}`);
              console.log(`ResourceProductionService: Потребление электричества майнерами: ${totalElectricityConsumption.toFixed(2)}`);
              console.log(`ResourceProductionService: Потребление вычислительной мощности: ${totalComputingPowerConsumption.toFixed(2)}`);
            }
            break;
          }
          
          // Добавляем и другие здания по мере необходимости
        }
      }
    }
  }

  /**
   * Рассчитывает базовое производство ресурсов от улучшений и других источников
   */
  private calculateBaseProduction(state: GameState, resources: { [key: string]: any }): void {
    // Обработка базового производства знаний (от исследований)
    if (resources.knowledge) {
      // Базовое производство знаний (возможно установлено "Основами блокчейна")
      const baseKnowledgeProduction = resources.knowledge.baseProduction || 0;
      
      // Добавляем базовое производство к общему
      resources.knowledge.production += baseKnowledgeProduction;
      
      console.log(`ResourceProductionService: Базовое производство знаний: ${baseKnowledgeProduction.toFixed(2)}`);
    }
    
    // Здесь можно добавить обработку базового производства для других ресурсов
  }

  /**
   * Убеждаемся, что критические ресурсы существуют и корректно настроены
   */
  private ensureCriticalResources(state: GameState, resources: { [key: string]: any }): void {
    // Список критически важных ресурсов и их настройки
    const criticalResourcesList = [
      { id: 'knowledge', name: 'Знания', baseProduction: 0, max: 100 },
      { id: 'usdt', name: 'USDT', baseProduction: 0, max: 50 },
      { id: 'electricity', name: 'Электричество', baseProduction: 0, max: 100 },
      { id: 'computingPower', name: 'Вычислительная мощность', baseProduction: 0, max: 1000 },
      { id: 'bitcoin', name: 'Bitcoin', baseProduction: 0, max: 0.01 }
    ];
    
    for (const critResource of criticalResourcesList) {
      // Проверяем только для разблокированных ресурсов
      if (!state.unlocks[critResource.id] && critResource.id !== 'knowledge') continue;
      
      if (!resources[critResource.id]) {
        console.warn(`ResourceProductionService: Критический ресурс ${critResource.id} отсутствует, создаем...`);
        
        // Создаем базовую структуру для ресурса
        resources[critResource.id] = {
          id: critResource.id,
          name: critResource.name,
          value: 0,
          production: 0,
          perSecond: 0,
          baseProduction: critResource.baseProduction,
          max: critResource.max,
          unlocked: true
        };
      }
    }
  }

  /**
   * Применяет финальные бонусы и рассчитывает итоговые скорости производства
   */
  private applyFinalBonuses(state: GameState, resources: { [key: string]: any }): void {
    // Проходим по всем ресурсам
    for (const resourceId in resources) {
      if (!resources[resourceId]) continue;
      
      const resource = resources[resourceId];
      
      // Получаем бонусы для ресурса
      const { productionMultiplier } = this.bonusCalculationService.calculateResourceBonuses(state, resourceId);
      
      // Применяем множитель к производству
      const finalProduction = resource.production * productionMultiplier;
      
      // Устанавливаем perSecond как итоговое производство в секунду
      resource.perSecond = finalProduction;
      
      // Логируем для ключевых ресурсов
      if (resourceId === 'knowledge') {
        console.log(`ResourceProductionService: Итоговое производство ${resourceId}: ${finalProduction.toFixed(2)} (базовое: ${resource.baseProduction}, множитель: ${productionMultiplier})`);
      } else {
        console.log(`ResourceProductionService: Итоговое производство ${resourceId}: ${finalProduction.toFixed(2)}`);
      }
    }
  }
}
