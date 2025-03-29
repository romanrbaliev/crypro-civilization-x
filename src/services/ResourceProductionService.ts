import { GameState } from '@/context/types';
import { Building } from '@/context/types';
import { Upgrade } from '@/context/types';

// Добавим импорт ролей
import { roles } from '@/utils/gameConfig';

interface ResourceBonuses {
  knowledge: number;
  usdt: number;
  electricity: number;
  computingPower: number;
}

export class ResourceProductionService {
  calculateBuildingProduction(building: Building): { [resourceId: string]: number } {
    const production: { [resourceId: string]: number } = {};

    for (const resourceId in building.production) {
      production[resourceId] = building.production[resourceId] || 0;
    }

    return production;
  }

  calculateBuildingConsumption(building: Building): { [resourceId: string]: number } {
    const consumption: { [resourceId: string]: number } = {};

    for (const resourceId in building.consumption) {
      consumption[resourceId] = building.consumption[resourceId] || 0;
    }

    return consumption;
  }

  calculateUpgradeEffects(upgrade: Upgrade): { [effectId: string]: number } {
    // Учитываем как effects, так и effect поля
    const effects = upgrade.effects || upgrade.effect || {};
    return effects;
  }

  calculateBuildingBonuses(state: GameState): { [buildingId: string]: number } {
    const bonuses: { [buildingId: string]: number } = {};

    for (const buildingId in state.buildings) {
      bonuses[buildingId] = state.buildings[buildingId].productionBoost || 0;
    }

    return bonuses;
  }

  // Исправим метод, чтобы он возвращал обновленную копию ресурсов, а не числа
  calculateResourceProduction(state: GameState): { [key: string]: any } {
    // Создаем копию ресурсов для изменения
    const updatedResources = JSON.parse(JSON.stringify(state.resources));
    
    // Проверяем, что USDT существует и разблокирован
    if (!updatedResources.usdt || !updatedResources.usdt.unlocked) {
      console.log("⚠️ В ResourceProductionService: USDT не найден, создаем его");
      updatedResources.usdt = {
        id: 'usdt',
        name: 'USDT',
        description: 'Стейблкоин, универсальная валюта для покупок',
        type: 'currency',
        icon: 'coins',
        value: state.usdtBalance || 0,
        baseProduction: 0,
        production: 0,
        perSecond: 0,
        max: 50,
        unlocked: true
      };
    }
    
    // Сбрасываем значения perSecond для всех ресурсов
    for (const resourceId in updatedResources) {
      if (updatedResources[resourceId].unlocked) {
        updatedResources[resourceId].perSecond = 0;
      }
    }
    
    // ИСПРАВЛЕНИЕ: Применяем все бонусы от исследований 
    // Проверка на "Основы блокчейна" и другие исследования, влияющие на базовое производство ресурсов
    for (const upgradeId in state.upgrades) {
      const upgrade = state.upgrades[upgradeId];
      
      if (upgrade.purchased) {
        // Обрабатываем особые исследования
        if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
          console.log("ResourceProductionService: Применен эффект Основ блокчейна");
          
          // Используем базовое производство и применяем к нему бонус
          if (updatedResources.knowledge) {
            const baseProduction = updatedResources.knowledge.baseProduction || 0;
            // Увеличиваем на 10%
            updatedResources.knowledge.baseProduction = baseProduction * 1.1;
          }
        }
        
        // Обрабатываем эффекты исследований на базе их полей effects или effect
        const effects = upgrade.effects || upgrade.effect || {};
        
        for (const [effectId, amount] of Object.entries(effects)) {
          if (effectId === 'knowledgeBoost' && updatedResources.knowledge) {
            const baseProduction = updatedResources.knowledge.baseProduction || 0;
            const boost = baseProduction * Number(amount);
            updatedResources.knowledge.baseProduction = baseProduction + boost;
            console.log(`ResourceProductionService: Применен knowledgeBoost из исследования ${upgrade.name}: ${baseProduction} + ${boost} = ${updatedResources.knowledge.baseProduction}`);
          }
        }
      }
    }
    
    // Особая обработка BTC для майнеров
    if (state.buildings.autoMiner && 
        state.buildings.autoMiner.count > 0 && 
        updatedResources.btc && 
        updatedResources.btc.unlocked) {
      // Производим BTC в зависимости от количества автомайнеров
      const btcPerSecond = 0.00005 * state.buildings.autoMiner.count;
      updatedResources.btc.perSecond = btcPerSecond;
      
      // Применяем бонусы майнинга, если есть
      if (state.miningParams && state.miningParams.miningEfficiency) {
        updatedResources.btc.perSecond *= state.miningParams.miningEfficiency;
      }
      
      console.log(`Расчет производства BTC: ${btcPerSecond} в секунду от ${state.buildings.autoMiner.count} автомайнеров`);
    }
    
    // Рассчитываем производство от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.unlocked && building.count > 0) {
        const buildingProduction = this.calculateBuildingProduction(building);
        
        for (const resourceId in buildingProduction) {
          if (updatedResources[resourceId] && updatedResources[resourceId].unlocked) {
            const productionPerSecond = buildingProduction[resourceId] * building.count;
            updatedResources[resourceId].perSecond += productionPerSecond;
          }
        }
      }
    }
    
    // Рассчитываем потребление от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.unlocked && building.count > 0 && building.consumption) {
        for (const resourceId in building.consumption) {
          if (updatedResources[resourceId] && updatedResources[resourceId].unlocked) {
            const consumptionPerSecond = building.consumption[resourceId] * building.count;
            updatedResources[resourceId].perSecond -= consumptionPerSecond;
          }
        }
      }
    }
    
    // Применяем бонусы от специализации, если она выбрана
    if (state.specialization && roles[state.specialization]) {
      const roleData = roles[state.specialization];
      const roleBonuses = roleData.bonuses || {};
      
      // Применяем соответствующие бонусы специализации
      for (const resourceId in updatedResources) {
        if (!updatedResources[resourceId].unlocked) continue;
        
        // Применяем общие бонусы роли
        if (roleBonuses.resourceProduction) {
          updatedResources[resourceId].perSecond *= (1 + roleBonuses.resourceProduction);
        }
        
        // Применяем специфичные бонусы для конкретных ресурсов
        switch (state.specialization) {
          case 'miner':
            if (resourceId === 'computingPower') {
              updatedResources[resourceId].perSecond *= 1.25; // +25% к вычислительной мощности
            }
            if (resourceId === 'btc') {
              updatedResources[resourceId].perSecond *= 1.40; // +40% к производству BTC для майнеров
            }
            break;
          case 'trader':
            if (resourceId === 'usdt') {
              updatedResources[resourceId].perSecond *= 1.15; // +15% к USDT
            }
            break;
          case 'investor':
            // Общий бонус ко всем ресурсам
            updatedResources[resourceId].perSecond *= 1.05; // +5% ко всем ресурсам
            break;
          case 'analyst':
            if (resourceId === 'knowledge') {
              updatedResources[resourceId].perSecond *= 1.25; // +25% к знаниям
            }
            break;
          case 'influencer':
            // Небольшой бонус ко всем ресурсам
            updatedResources[resourceId].perSecond *= 1.1; // +10% ко всем ресурсам
            break;
        }
      }
    }
    
    return updatedResources;
  }

  calculateResourceConsumption(state: GameState): { [resourceId: string]: number } {
    const consumption: { [resourceId: string]: number } = {};

    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.unlocked) {
        const buildingConsumption = this.calculateBuildingConsumption(building);
        for (const resourceId in buildingConsumption) {
          consumption[resourceId] = (consumption[resourceId] || 0) + buildingConsumption[resourceId] * building.count;
        }
      }
    }

    return consumption;
  }

  calculateUpgradeBonuses(state: GameState): { [upgradeId: string]: number } {
    const bonuses: { [upgradeId: string]: number } = {};

    for (const upgradeId in state.upgrades) {
      if (state.upgrades[upgradeId].purchased) {
        const upgrade = state.upgrades[upgradeId];
        const upgradeEffects = this.calculateUpgradeEffects(upgrade);

        for (const effectId in upgradeEffects) {
          bonuses[effectId] = (bonuses[effectId] || 0) + upgradeEffects[effectId];
        }
      }
    }

    return bonuses;
  }

  // Обновим метод calculateResourceBonuses, чтобы учитывать бонусы специализации
  calculateResourceBonuses(state: GameState): ResourceBonuses {
    const bonuses: ResourceBonuses = {
      knowledge: 0,
      usdt: 0,
      electricity: 0,
      computingPower: 0
    };

    // Бонусы от зданий
    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      bonuses[buildingId] = building.productionBoost || 0;
    }

    // Бонусы от улучшений
    const upgradeBonuses = this.calculateUpgradeBonuses(state);
    for (const bonusType in upgradeBonuses) {
      bonuses[bonusType] = (bonuses[bonusType] || 0) + upgradeBonuses[bonusType];
    }

    // Бонусы от специализации
    if (state.specialization && roles[state.specialization]) {
      const roleData = roles[state.specialization];
      const roleBonuses = roleData.bonuses;
      
      // Применяем соответствующие бонусы специализации
      if (roleBonuses.hashrateEfficiency) {
        bonuses.computingPower += roleBonuses.hashrateEfficiency;
      }
      
      // Для каждой специализации добавляем соответствующие бонусы
      switch (state.specialization) {
        case 'miner':
          // Майнер получает бонус к вычислительной мощности
          bonuses.computingPower += 0.1; // +10% к вычислительной мощности
          break;
        case 'trader':
          // Трейдер получает бонус к получению USDT
          bonuses.usdt += 0.05; // +5% к получению USDT
          break;
        case 'investor':
          // Инвестор получает общий бонус ко всем ресурсам
          bonuses.knowledge += 0.03; // +3% к получению знаний
          bonuses.usdt += 0.03; // +3% к получению USDT
          bonuses.electricity += 0.03; // +3% к получению электричества
          bonuses.computingPower += 0.03; // +3% к вычислительной мощности
          break;
        case 'analyst':
          // Аналитик получает бонус к получению знаний
          bonuses.knowledge += 0.15; // +15% к получению знаний
          break;
        case 'influencer':
          // Инфлюенсер получает небольшой бонус ко всем ресурсам
          bonuses.knowledge += 0.05; // +5% к получению знаний
          bonuses.usdt += 0.05; // +5% к получению USDT
          break;
      }
    }

    return bonuses;
  }
}
