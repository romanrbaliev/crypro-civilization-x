
import { GameState } from '@/context/types';
import { BonusCalculationService } from './BonusCalculationService';

/**
 * Сервис для расчёта производства ресурсов
 */
export class ResourceProductionService {
  private bonusCalculationService: BonusCalculationService;
  
  constructor() {
    this.bonusCalculationService = new BonusCalculationService();
  }
  
  /**
   * Вычисляет производство всех ресурсов на основе текущего состояния
   */
  calculateResourceProduction(state: GameState): { [key: string]: any } {
    console.log("ResourceProductionService: Расчёт производства ресурсов");
    
    const updatedResources = { ...state.resources };
    
    // Расчёт производства для каждого ресурса
    for (const resourceId in updatedResources) {
      if (updatedResources[resourceId].unlocked) {
        updatedResources[resourceId] = this.calculateSingleResourceProduction(
          state,
          resourceId,
          updatedResources[resourceId]
        );
      }
    }
    
    return updatedResources;
  }
  
  /**
   * Вычисляет производство для одного ресурса
   */
  private calculateSingleResourceProduction(
    state: GameState,
    resourceId: string,
    resource: any
  ): any {
    // Получаем бонусы для данного ресурса
    const { productionMultiplier } = this.bonusCalculationService.calculateResourceBonuses(state, resourceId);
    
    // Рассчитываем базовое производство в зависимости от типа ресурса
    let baseProduction = 0;
    
    switch (resourceId) {
      case 'knowledge':
        // Базовое производство знаний от практики
        const practiceCount = state.buildings.practice?.count || 0;
        if (practiceCount > 0) {
          // Практика даёт 0.21 за единицу
          baseProduction = practiceCount * 0.21 * 3; // 0.21 * 3 = 0.63 за каждую практику
          console.log(`ResourceProductionService: Базовое производство знаний от практики: ${baseProduction} (${practiceCount} × 0.63)`);
        }
        break;
      
      case 'electricity':
        // Производство электричества от генераторов
        const generatorCount = state.buildings.generator?.count || 0;
        baseProduction = generatorCount * 0.5; // 0.5 за генератор
        console.log(`ResourceProductionService: Базовое производство электричества: ${baseProduction} (${generatorCount} × 0.5)`);
        break;
      
      case 'computingPower':
        // Производство вычислительной мощности от домашних компьютеров
        const homeComputerCount = state.buildings.homeComputer?.count || 0;
        baseProduction = homeComputerCount * 2; // 2 за компьютер
        console.log(`ResourceProductionService: Базовое производство вычислительной мощности: ${baseProduction} (${homeComputerCount} × 2)`);
        
        // Проверяем достаточно ли электричества для работы компьютеров
        const electricityPerComputer = 1; // 1 единица электричества на компьютер
        const requiredElectricity = homeComputerCount * electricityPerComputer;
        const availableElectricity = state.resources.electricity?.value || 0;
        
        if (requiredElectricity > availableElectricity && requiredElectricity > 0) {
          // Снижаем производство пропорционально доступному электричеству
          const ratio = availableElectricity / requiredElectricity;
          baseProduction *= ratio;
          console.log(`ResourceProductionService: Недостаточно электричества. Снижение производства вычислительной мощности до ${baseProduction} (коэффициент: ${ratio.toFixed(2)})`);
        }
        break;
      
      case 'bitcoin':
        // Производство Bitcoin от автомайнера
        if (state.buildings.autoMiner && state.buildings.autoMiner.count > 0) {
          const autoMinerCount = state.buildings.autoMiner.count;
          baseProduction = autoMinerCount * 0.00005; // 0.00005 BTC за автомайнер
          console.log(`ResourceProductionService: Базовое производство Bitcoin: ${baseProduction} (${autoMinerCount} × 0.00005)`);
          
          // Учитываем эффективность майнинга
          const miningEfficiency = state.miningParams?.miningEfficiency || 1;
          baseProduction *= miningEfficiency;
          console.log(`ResourceProductionService: Производство Bitcoin с учетом эффективности: ${baseProduction} (множитель: ${miningEfficiency})`);
        }
        break;
      
      // Другие ресурсы при необходимости
    }
    
    // Применяем множитель производства
    const totalProduction = baseProduction * productionMultiplier;
    
    // Логируем расчеты для отладки
    console.log(`ResourceProductionService: Итоговое производство ${resourceId}: ${totalProduction} (базовое: ${baseProduction}, множитель: ${productionMultiplier})`);
    
    return {
      ...resource,
      baseProduction,
      production: totalProduction,
      perSecond: totalProduction
    };
  }
}
