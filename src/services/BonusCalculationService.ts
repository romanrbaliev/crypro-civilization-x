import { GameState } from '@/context/types';
import * as ResourceCalculations from '@/utils/resourceCalculations';

/**
 * Сервис для расчета бонусов и эффектов
 */
export class BonusCalculationService {
  /**
   * Применяет все бонусы к состоянию игры
   */
  applyAllBonuses(state: GameState): GameState {
    let newState = { ...state };
    
    // Применяем бонусы от зданий
    newState = this.applyBuildingBonuses(newState);
    
    // Применяем бонусы от исследований
    newState = this.applyUpgradeBonuses(newState);
    
    // Применяем бонусы от специализаций
    newState = this.applySpecializationBonuses(newState);
    
    // Применяем бонусы от синергий
    newState = this.applySynergyBonuses(newState);
    
    // Пересчитываем производство ресурсов с учетом всех бонусов
    newState = ResourceCalculations.calculateResourceProduction(newState);
    
    return newState;
  }
  
  /**
   * Применяет бонусы от зданий
   */
  applyBuildingBonuses(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Проходим по всем зданиям
    Object.values(state.buildings).forEach(building => {
      if (building.count <= 0 || !building.effects) return;
      
      // Применяем эффекты здания
      Object.entries(building.effects).forEach(([effectId, value]) => {
        // Эффекты увеличения максимального количества ресурсов
        if (effectId === 'maxUSDTBoost' && resources.usdt) {
          resources.usdt.max += Number(value) * building.count;
        }
        else if (effectId === 'maxKnowledgeBoost' && resources.knowledge) {
          resources.knowledge.max += Number(value) * building.count;
        }
        else if (effectId === 'maxBTCBoost' && resources.bitcoin) {
          resources.bitcoin.max += Number(value) * building.count;
        }
        // Процентные бонусы к максимальному количеству ресурсов
        else if (effectId === 'maxKnowledgePercentBoost' && resources.knowledge) {
          const baseMax = 100; // Базовое максимальное значение знаний
          resources.knowledge.max += baseMax * Number(value) * building.count;
        }
        else if (effectId === 'maxUSDTPercentBoost' && resources.usdt) {
          const baseMax = 100; // Базовое максимальное значение USDT
          resources.usdt.max += baseMax * Number(value) * building.count;
        }
        // Бонусы к производству
        else if (effectId === 'knowledgeProductionBoost') {
          // Этот эффект будет применен при расчете производства
        }
        else if (effectId === 'computingEfficiencyBoost') {
          // Этот эффект будет применен при расчете производства
        }
        else if (effectId === 'btcExchangeEfficiencyBoost') {
          // Этот эффект будет применен при обмене BTC
        }
      });
    });
    
    newState.resources = resources;
    return newState;
  }
  
  /**
   * Применяет бонусы от исследований
   */
  applyUpgradeBonuses(state: GameState): GameState {
    const newState = { ...state };
    const resources = { ...state.resources };
    
    // Проходим по всем исследованиям
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased || !upgrade.effects) return;
      
      // Применяем эффекты исследования
      Object.entries(upgrade.effects).forEach(([effectId, value]) => {
        // Эффекты увеличения максимального количества ресурсов
        if (effectId === 'maxKnowledgeBoost' && resources.knowledge) {
          resources.knowledge.max += Number(value);
        }
        else if (effectId === 'maxUSDTBoost' && resources.usdt) {
          resources.usdt.max += Number(value);
        }
        // Процентные бонусы к максимальному количеству ресурсов
        else if (effectId === 'maxKnowledgePercentBoost' && resources.knowledge) {
          const baseMax = 100; // Базовое максимальное значение знаний
          resources.knowledge.max += baseMax * Number(value);
        }
        else if (effectId === 'maxUSDTPercentBoost' && resources.usdt) {
          const baseMax = 100; // Базовое максимальное значение USDT
          resources.usdt.max += baseMax * Number(value);
        }
        // Бонусы к производству
        else if (effectId === 'knowledgeProductionBoost') {
          // Этот эффект будет применен при расчете производства
        }
        else if (effectId === 'miningEfficiencyBoost') {
          // Этот эффект будет применен при расчете майнинга
        }
        else if (effectId === 'electricityConsumptionReduction') {
          // Этот эффект будет применен при расчете потребления
        }
      });
    });
    
    newState.resources = resources;
    return newState;
  }
  
  /**
   * Применяет бонусы от специализаций
   */
  applySpecializationBonuses(state: GameState) {
    if (!state.player) return state;
    
    // Получаем специализацию игрока из свойства player
    const playerSpecialization = state.player.specialization;
    
    if (!playerSpecialization || !state.specializations || !state.specializations[playerSpecialization]) {
      return state;
    }
    
    // Получаем бонусы специализации
    const specializationBonuses = state.specializations[playerSpecialization].bonuses;
    
    // Создаем новое состояние
    const newState = { ...state };
    
    // Применяем бонусы специализации
    // Это будет реализовано в будущем
    
    return newState;
  }
  
  /**
   * Применяет бонусы от синергий
   */
  applySynergyBonuses(state: GameState) {
    if (!state.player) return state;
    
    // Если synergies не определены, возвращаем состояние без изменений
    if (!state.synergies) return state;
    
    // Получаем активные синергии
    const activeSynergies = Object.values(state.synergies).filter(synergy => synergy.active);
    
    if (activeSynergies.length === 0) {
      return state;
    }
    
    // Создаем новое состояние
    const newState = { ...state };
    
    // Применяем бонусы от активных синергий
    // Это будет реализовано в будущем
    
    return newState;
  }
  
  /**
   * Рассчитывает общий бонус к производству ресурса
   */
  calculateProductionBonus(state: GameState, resourceId: string): number {
    let bonus = 0;
    
    // Бонусы от зданий
    Object.values(state.buildings).forEach(building => {
      if (building.count <= 0 || !building.effects) return;
      
      Object.entries(building.effects).forEach(([effectId, value]) => {
        if (effectId === `${resourceId}ProductionBoost`) {
          bonus += Number(value) * building.count;
        }
      });
    });
    
    // Бонусы от исследований
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased || !upgrade.effects) return;
      
      Object.entries(upgrade.effects).forEach(([effectId, value]) => {
        if (effectId === `${resourceId}ProductionBoost`) {
          bonus += Number(value);
        }
      });
    });
    
    // Бонусы от специализаций
    if (state.player && state.player.specialization && state.specializations) {
      const specialization = state.specializations[state.player.specialization];
      if (specialization && specialization.bonuses) {
        Object.entries(specialization.bonuses).forEach(([effectId, value]) => {
          if (effectId === `${resourceId}ProductionBoost`) {
            bonus += Number(value);
          }
        });
      }
    }
    
    return bonus;
  }
  
  /**
   * Рассчитывает общий бонус к потреблению ресурса (отрицательный бонус = снижение потребления)
   */
  calculateConsumptionBonus(state: GameState, resourceId: string): number {
    let bonus = 0;
    
    // Бонусы от зданий
    Object.values(state.buildings).forEach(building => {
      if (building.count <= 0 || !building.effects) return;
      
      Object.entries(building.effects).forEach(([effectId, value]) => {
        if (effectId === `${resourceId}ConsumptionReduction`) {
          bonus -= Number(value) * building.count;
        }
      });
    });
    
    // Бонусы от исследований
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased || !upgrade.effects) return;
      
      Object.entries(upgrade.effects).forEach(([effectId, value]) => {
        if (effectId === `${resourceId}ConsumptionReduction`) {
          bonus -= Number(value);
        }
      });
    });
    
    // Бонусы от специализаций
    if (state.player && state.player.specialization && state.specializations) {
      const specialization = state.specializations[state.player.specialization];
      if (specialization && specialization.bonuses) {
        Object.entries(specialization.bonuses).forEach(([effectId, value]) => {
          if (effectId === `${resourceId}ConsumptionReduction`) {
            bonus -= Number(value);
          }
        });
      }
    }
    
    return bonus;
  }
  
  /**
   * Получает бонусы специализации
   */
  getSpecializationBonuses(state: GameState) {
    if (!state.player) return {};
    
    // Получаем специализацию игрока из свойства player
    const playerSpecialization = state.player.specialization;
    
    if (!playerSpecialization || !state.specializations || !state.specializations[playerSpecialization]) {
      return {};
    }
    
    return state.specializations[playerSpecialization].bonuses || {};
  }
  
  /**
   * Получает бонусы синергий
   */
  getSynergyBonuses(state: GameState) {
    if (!state.synergies) return {};
    
    const bonuses = {};
    
    // Получаем активные синергии
    const activeSynergies = Object.values(state.synergies).filter(synergy => synergy.active);
    
    activeSynergies.forEach(synergy => {
      if (synergy.bonuses) {
        Object.entries(synergy.bonuses).forEach(([key, value]) => {
          bonuses[key] = (bonuses[key] || 0) + Number(value);
        });
      }
    });
    
    return bonuses;
  }
}
