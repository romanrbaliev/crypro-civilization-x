
import { GameState, Resource } from '@/context/types';

export class ResourceProductionService {
  /**
   * Рассчитывает производство всех ресурсов
   */
  calculateResourceProduction(state: GameState): { [key: string]: Resource } {
    // Копируем все ресурсы
    const resources = { ...state.resources };
    
    // Сбрасываем значения производства для всех ресурсов
    for (const resourceId in resources) {
      resources[resourceId] = {
        ...resources[resourceId],
        baseProduction: 0,
        production: 0,
        perSecond: 0
      };
    }
    
    // Производство от здания "Практика" (+1 знание/сек)
    if (state.buildings.practice && state.buildings.practice.count > 0 && state.buildings.practice.unlocked) {
      const practiceCount = state.buildings.practice.count;
      
      // Если ресурс знаний существует, обновляем его
      if (resources.knowledge) {
        console.log(`Здание Практика (${practiceCount} шт.) добавляет +${practiceCount}/сек к производству знаний`);
        
        resources.knowledge = {
          ...resources.knowledge,
          baseProduction: (resources.knowledge.baseProduction || 0) + practiceCount,
          production: (resources.knowledge.production || 0) + practiceCount
        };
      }
    }
    
    // Производство от здания "Генератор" (+0.5 электричества/сек)
    if (state.buildings.generator && state.buildings.generator.count > 0 && state.buildings.generator.unlocked) {
      const generatorCount = state.buildings.generator.count;
      const electricityProduction = 0.5 * generatorCount;
      
      if (resources.electricity) {
        console.log(`Здание Генератор (${generatorCount} шт.) добавляет +${electricityProduction}/сек к производству электричества`);
        
        resources.electricity = {
          ...resources.electricity,
          baseProduction: (resources.electricity.baseProduction || 0) + electricityProduction,
          production: (resources.electricity.production || 0) + electricityProduction
        };
      } else {
        // Создаем ресурс электричества, если его нет
        resources.electricity = {
          id: 'electricity',
          name: 'Электричество',
          description: 'Электроэнергия для питания устройств',
          icon: 'zap',
          type: 'resource',
          value: 0,
          max: 100,
          unlocked: true,
          baseProduction: electricityProduction,
          production: electricityProduction,
          perSecond: electricityProduction
        };
        
        console.log(`Создан ресурс электричества с производством ${electricityProduction}/сек`);
      }
    }
    
    // Домашний компьютер: +2 вычисл. мощности/сек при потреблении 1 электр./сек
    if (state.buildings.homeComputer && state.buildings.homeComputer.count > 0 && state.buildings.homeComputer.unlocked) {
      const computerCount = state.buildings.homeComputer.count;
      const powerConsumption = -1 * computerCount; // Потребление электричества
      const computingProduction = 2 * computerCount; // Производство вычислительной мощности
      
      // Применяем потребление электричества
      if (resources.electricity) {
        console.log(`Домашний компьютер (${computerCount} шт.) потребляет ${Math.abs(powerConsumption)}/сек электричества`);
        
        resources.electricity = {
          ...resources.electricity,
          baseProduction: (resources.electricity.baseProduction || 0) + powerConsumption,
          production: (resources.electricity.production || 0) + powerConsumption
        };
      }
      
      // Обновляем или создаем вычислительную мощность
      if (resources.computingPower) {
        console.log(`Домашний компьютер (${computerCount} шт.) добавляет +${computingProduction}/сек к производству вычислительной мощности`);
        
        resources.computingPower = {
          ...resources.computingPower,
          baseProduction: (resources.computingPower.baseProduction || 0) + computingProduction,
          production: (resources.computingPower.production || 0) + computingProduction
        };
      } else {
        // Создаем ресурс вычислительной мощности, если его нет
        resources.computingPower = {
          id: 'computingPower',
          name: 'Вычислительная мощность',
          description: 'Вычислительная мощность для майнинга',
          icon: 'cpu',
          type: 'resource',
          value: 0,
          max: 1000,
          unlocked: true,
          baseProduction: computingProduction,
          production: computingProduction,
          perSecond: computingProduction
        };
        
        console.log(`Создан ресурс вычислительной мощности с производством ${computingProduction}/сек`);
      }
    }
    
    // Дополнительная логика для майнеров
    if ((state.buildings.miner || state.buildings.autoMiner) && resources.bitcoin) {
      const minerKey = state.buildings.miner ? 'miner' : 'autoMiner';
      const minerBuilding = state.buildings[minerKey];
      
      if (minerBuilding && minerBuilding.count > 0 && minerBuilding.unlocked) {
        const minerCount = minerBuilding.count;
        const electricityConsumption = -1 * minerCount; // Потребление электричества
        const computingPowerConsumption = -5 * minerCount; // Потребление вычислительной мощности
        const bitcoinProduction = 0.00005 * minerCount; // Производство Bitcoin
        
        // Применяем потребление электричества
        if (resources.electricity) {
          console.log(`Майнер (${minerCount} шт.) потребляет ${Math.abs(electricityConsumption)}/сек электричества`);
          
          resources.electricity = {
            ...resources.electricity,
            baseProduction: (resources.electricity.baseProduction || 0) + electricityConsumption,
            production: (resources.electricity.production || 0) + electricityConsumption
          };
        }
        
        // Применяем потребление вычислительной мощности
        if (resources.computingPower) {
          console.log(`Майнер (${minerCount} шт.) потребляет ${Math.abs(computingPowerConsumption)}/сек вычислительной мощности`);
          
          resources.computingPower = {
            ...resources.computingPower,
            baseProduction: (resources.computingPower.baseProduction || 0) + computingPowerConsumption,
            production: (resources.computingPower.production || 0) + computingPowerConsumption
          };
        }
        
        // Обновляем производство Bitcoin
        console.log(`Майнер (${minerCount} шт.) производит ${bitcoinProduction}/сек Bitcoin`);
        
        resources.bitcoin = {
          ...resources.bitcoin,
          baseProduction: (resources.bitcoin.baseProduction || 0) + bitcoinProduction,
          production: (resources.bitcoin.production || 0) + bitcoinProduction
        };
      }
    }
    
    // Интернет-канал: +20% к скорости получения знаний, +5% к эффективности производства вычисл. мощности
    if (state.buildings.internetChannel && state.buildings.internetChannel.count > 0 && state.buildings.internetChannel.unlocked) {
      const channelCount = state.buildings.internetChannel.count;
      const knowledgeBoost = 0.2 * channelCount; // +20% на каждый уровень
      const computingBoost = 0.05 * channelCount; // +5% на каждый уровень
      
      // Применяем бонус к знаниям
      if (resources.knowledge && resources.knowledge.production > 0) {
        const baseProduction = resources.knowledge.production;
        const bonus = baseProduction * knowledgeBoost;
        
        console.log(`Интернет-канал (${channelCount} шт.) добавляет +${knowledgeBoost * 100}% (${bonus.toFixed(2)}/сек) к производству знаний`);
        
        resources.knowledge.production += bonus;
      }
      
      // Применяем бонус к вычислительной мощности
      if (resources.computingPower && resources.computingPower.production > 0) {
        const baseProduction = resources.computingPower.production;
        const bonus = baseProduction * computingBoost;
        
        console.log(`Интернет-канал (${channelCount} шт.) добавляет +${computingBoost * 100}% (${bonus.toFixed(2)}/сек) к производству вычислительной мощности`);
        
        resources.computingPower.production += bonus;
      }
    }
    
    // Пересчитываем perSecond для всех ресурсов на основе production
    for (const resourceId in resources) {
      if (resources[resourceId].production !== undefined) {
        resources[resourceId].perSecond = resources[resourceId].production;
      }
    }
    
    // Логируем конечные значения производства
    console.log("ResourceProductionService: скорость производства знаний=" + 
      (resources.knowledge?.perSecond || 0).toFixed(2) + "/сек");
    
    return resources;
  }
}
