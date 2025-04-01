import { GameState } from '@/context/types';

/**
 * Сервис для расчета производства ресурсов
 */
export class ResourceProductionService {
  /**
   * Рассчитывает производство всех ресурсов
   */
  public calculateResourceProduction(state: GameState): { [key: string]: any } {
    console.log('ResourceProductionService: Расчет производства ресурсов');
    
    // Создаем копию ресурсов для изменения
    const resources = { ...state.resources };
    
    // Рассчитываем производство для Знаний
    if (resources.knowledge) {
      // Базовое производство
      let knowledgeProduction = 0;
      
      // Добавляем производство от зданий Практика (строго 1 знание/сек за каждое здание)
      if (state.buildings.practice && state.buildings.practice.count > 0) {
        knowledgeProduction = state.buildings.practice.count;
        console.log(`ResourceProductionService: Производство знаний от практики: ${knowledgeProduction}`);
      }
      
      // Применяем эффекты от улучшений к базовому производству
      if (resources.knowledge.baseProduction) {
        knowledgeProduction += resources.knowledge.baseProduction;
      }
      
      // Сохраняем расчеты в ресурс
      resources.knowledge = {
        ...resources.knowledge,
        production: knowledgeProduction,  // Суммарное производство
        perSecond: knowledgeProduction    // Производство в секунду
      };
      
      console.log(`ResourceProductionService: Итоговое производство knowledge: ${knowledgeProduction.toFixed(2)} (базовое: ${resources.knowledge.baseProduction || 0}, множитель: 1)`);
    }
    
    // Рассчитываем производство для Электричества
    if (resources.electricity) {
      // Базовое производство
      let electricityProduction = 0;
      
      // Добавляем производство от генераторов (строго 0.5 электричества/сек за каждый генератор)
      if (state.buildings.generator && state.buildings.generator.count > 0) {
        electricityProduction = state.buildings.generator.count * 0.5;
        console.log(`ResourceProductionService: Производство электричества от генераторов: ${electricityProduction}`);
      }
      
      // Сохраняем расчеты в ресурс
      resources.electricity = {
        ...resources.electricity,
        production: electricityProduction,  // Суммарное производство
        perSecond: electricityProduction    // Производство в секунду
      };
      
      console.log(`ResourceProductionService: Итоговое производство electricity: ${electricityProduction.toFixed(2)}`);
    }
    
    // Рассчитываем производство для Вычислительной мощности
    if (resources.computingPower) {
      // Базовое производство
      let computingPowerProduction = 0;
      
      // Добавляем производство от домашних компьютеров (строго 0.25 вычислительной мощности/сек за каждый компьютер)
      if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0) {
        computingPowerProduction = state.buildings.homeComputer.count * 0.25;
        console.log(`ResourceProductionService: Производство вычислительной мощности от домашних компьютеров: ${computingPowerProduction}`);
      }
      
      // Сохраняем расчеты в ресурс
      resources.computingPower = {
        ...resources.computingPower,
        production: computingPowerProduction,  // Суммарное производство
        perSecond: computingPowerProduction    // Производство в секунду
      };
      
      console.log(`ResourceProductionService: Итоговое производство computingPower: ${computingPowerProduction.toFixed(2)}`);
    }
    
    // Рассчитываем производство для USDT (если он разблокирован)
    if (resources.usdt && resources.usdt.unlocked) {
      let usdtProduction = 0;
      
      // USDT можно получить только применяя знания
      resources.usdt = {
        ...resources.usdt,
        production: usdtProduction,
        perSecond: usdtProduction
      };
    }
    
    // Рассчитываем производство для Bitcoin (если он разблокирован)
    if (resources.bitcoin && resources.bitcoin.unlocked) {
      let bitcoinProduction = 0;
      
      // Добавляем производство от автомайнеров (зависит от их количества и эффективности майнинга)
      if (state.buildings.autoMiner && state.buildings.autoMiner.count > 0) {
        bitcoinProduction = 0.00005 * state.buildings.autoMiner.count * (state.miningParams?.miningEfficiency || 1);
        console.log(`ResourceProductionService: Производство Bitcoin от автомайнеров: ${bitcoinProduction}`);
      }
      
      resources.bitcoin = {
        ...resources.bitcoin,
        production: bitcoinProduction,
        perSecond: bitcoinProduction
      };
    }

    return resources;
  }
}
