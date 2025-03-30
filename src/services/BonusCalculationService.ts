
import { GameState } from '@/context/types';

/**
 * Сервис для централизованного расчета всех бонусов и модификаторов
 * Предотвращает дублирование и нестабильность расчетов в разных частях системы
 */
export class BonusCalculationService {
  /**
   * Рассчитывает все бонусы и модификаторы для ресурса
   * @param state Текущее состояние игры
   * @param resourceId Идентификатор ресурса
   * @returns Объект с коэффициентами для ресурса
   */
  calculateResourceBonuses(state: GameState, resourceId: string): {
    productionMultiplier: number;
    storageMultiplier: number;
    efficiencyMultiplier: number;
  } {
    // Базовые значения
    let productionMultiplier = 1.0;
    let storageMultiplier = 1.0;
    let efficiencyMultiplier = 1.0;
    
    // Бонусы от зданий
    Object.values(state.buildings).forEach(building => {
      if (!building.unlocked || building.count <= 0) return;
      
      // Проверяем специфичные эффекты зданий
      switch (building.id) {
        case 'practice':
          if (resourceId === 'knowledge') {
            // Практика даёт фиксированный бонус +0.21 за уровень, а не множитель
            // Этот бонус учитывается в расчете базовой продукции, а не здесь
          }
          break;
        
        case 'cryptoWallet':
          if (resourceId === 'usdt') {
            storageMultiplier += 0.1 * building.count; // +10% к максимуму хранения за уровень
          } else if (resourceId === 'knowledge') {
            storageMultiplier += 0.05 * building.count; // +5% к максимуму хранения за уровень
          }
          break;
        
        case 'internetConnection':
          if (resourceId === 'knowledge') {
            productionMultiplier += 0.2; // +20% к производству знаний
          }
          break;
        
        // Другие здания и их эффекты
      }
    });
    
    // Бонусы от исследований
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased) return;
      
      // Проверяем эффекты конкретных исследований
      switch (upgrade.id) {
        case 'blockchainBasics':
        case 'basicBlockchain':
        case 'blockchain_basics':
          if (resourceId === 'knowledge') {
            productionMultiplier += 0.1; // +10% к производству знаний
            storageMultiplier += 0.5; // +50% к максимуму хранения
            console.log(`BonusCalculationService: Применен бонус от Основ блокчейна: +10% к производству, +50% к макс. знаний`);
          }
          break;
        
        case 'cryptoCurrencyBasics':
          if (resourceId === 'bitcoin') {
            productionMultiplier += 0.1; // +10% к эффективности добычи
          }
          break;
        
        case 'algorithmOptimization':
          if (resourceId === 'bitcoin') {
            productionMultiplier += 0.15; // +15% к эффективности майнинга
          }
          break;
        
        // Другие исследования и их эффекты
      }
      
      // Учитываем универсальные эффекты из объекта effects
      const effects = upgrade.effects || upgrade.effect || {};
      
      for (const [effectId, amount] of Object.entries(effects)) {
        const numAmount = Number(amount);
        
        if (effectId === `${resourceId}Boost` && !Number.isNaN(numAmount)) {
          productionMultiplier += numAmount;
        } else if (effectId === `${resourceId}MaxBoost` && !Number.isNaN(numAmount)) {
          storageMultiplier += numAmount;
        } else if (effectId === `${resourceId}EfficiencyBoost` && !Number.isNaN(numAmount)) {
          efficiencyMultiplier += numAmount;
        }
      }
    });
    
    // Бонусы от специализации
    if (state.specialization) {
      switch (state.specialization) {
        case 'miner':
          if (resourceId === 'computingPower') {
            productionMultiplier += 0.25; // +25% к вычислительной мощности
          } else if (resourceId === 'bitcoin') {
            productionMultiplier += 0.4; // +40% к производству Bitcoin
          }
          break;
        
        case 'trader':
          if (resourceId === 'usdt') {
            productionMultiplier += 0.15; // +15% к USDT
          }
          break;
        
        case 'investor':
          // Общий бонус ко всем ресурсам
          productionMultiplier += 0.05; // +5% ко всем ресурсам
          break;
        
        case 'analyst':
          if (resourceId === 'knowledge') {
            productionMultiplier += 0.25; // +25% к знаниям
          }
          break;
        
        case 'influencer':
          productionMultiplier += 0.1; // +10% ко всем ресурсам
          break;
      }
    }
    
    console.log(`BonusCalculationService: Рассчитаны множители для ${resourceId}: производство x${productionMultiplier.toFixed(2)}, хранение x${storageMultiplier.toFixed(2)}, эффективность x${efficiencyMultiplier.toFixed(2)}`);
    
    return {
      productionMultiplier,
      storageMultiplier,
      efficiencyMultiplier
    };
  }
  
  /**
   * Рассчитывает модификатор для майнинга
   */
  calculateMiningEfficiency(state: GameState): number {
    let miningEfficiency = 1.0;
    
    // Проверяем исследования, влияющие на эффективность майнинга
    Object.values(state.upgrades).forEach(upgrade => {
      if (!upgrade.purchased) return;
      
      if (upgrade.id === 'algorithmOptimization') {
        miningEfficiency *= 1.15; // +15% к эффективности майнинга
      } else if (upgrade.id === 'cryptoCurrencyBasics') {
        miningEfficiency *= 1.1; // +10% к эффективности добычи
      }
      
      // Учитываем универсальные эффекты
      const effects = upgrade.effects || upgrade.effect || {};
      
      if (effects.miningEfficiencyBoost) {
        miningEfficiency *= (1 + Number(effects.miningEfficiencyBoost));
      }
    });
    
    // Учитываем специализацию
    if (state.specialization === 'miner') {
      miningEfficiency *= 1.25; // +25% для майнера
    }
    
    console.log(`BonusCalculationService: Рассчитан множитель эффективности майнинга: x${miningEfficiency.toFixed(2)}`);
    
    return miningEfficiency;
  }
  
  /**
   * Применяет бонусы от улучшения к состоянию игры
   */
  applyUpgradeBonuses(state: GameState, upgradeId: string): GameState {
    console.log(`BonusCalculationService: Применение бонусов от улучшения ${upgradeId}`);
    
    // Создаем копию состояния для изменения
    let newState = { ...state };
    
    // Проверяем наличие и статус улучшения
    const upgrade = state.upgrades[upgradeId];
    if (!upgrade || !upgrade.purchased) {
      console.log(`BonusCalculationService: Улучшение ${upgradeId} не найдено или не приобретено`);
      return state;
    }
    
    // Применяем специфические эффекты в зависимости от ID улучшения
    switch (upgradeId) {
      case 'blockchainBasics':
      case 'basicBlockchain':
      case 'blockchain_basics':
        if (newState.resources.knowledge) {
          console.log(`BonusCalculationService: Применяем эффект от Основ блокчейна`);
          // Эффект уже учтен в calculateResourceBonuses, но можно добавить дополнительные действия
        }
        break;
      
      // Добавьте другие специфичные улучшения по необходимости
    }
    
    return newState;
  }
  
  /**
   * Полностью пересчитывает все бонусы в игре
   */
  recalculateAllBonuses(state: GameState): GameState {
    console.log(`BonusCalculationService: Полный пересчет всех бонусов`);
    
    // Создаем копию состояния для изменения
    let newState = { ...state };
    
    // Здесь можно добавить дополнительную логику для пересчета всех бонусов
    // Например, обновление параметров майнинга
    if (newState.miningParams) {
      newState.miningParams.miningEfficiency = this.calculateMiningEfficiency(state);
    }
    
    return newState;
  }
}
