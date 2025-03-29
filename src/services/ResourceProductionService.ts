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
    return upgrade.effects || {};
  }

  calculateBuildingBonuses(state: GameState): { [buildingId: string]: number } {
    const bonuses: { [buildingId: string]: number } = {};

    for (const buildingId in state.buildings) {
      bonuses[buildingId] = state.buildings[buildingId].productionBoost || 0;
    }

    return bonuses;
  }

  calculateResourceProduction(state: GameState): { [resourceId: string]: number } {
    const production: { [resourceId: string]: number } = {};

    for (const buildingId in state.buildings) {
      const building = state.buildings[buildingId];
      if (building.unlocked) {
        const buildingProduction = this.calculateBuildingProduction(building);
        for (const resourceId in buildingProduction) {
          production[resourceId] = (production[resourceId] || 0) + buildingProduction[resourceId] * building.count;
        }
      }
    }

    return production;
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
