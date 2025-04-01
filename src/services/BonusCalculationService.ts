import { GameState } from '@/context/types';

/**
 * Сервис для расчёта бонусов от исследований и зданий
 */
export class BonusCalculationService {
  /**
   * Расчет бонусов для конкретного ресурса
   */
  calculateResourceBonuses(state: GameState, resourceId: string): { productionMultiplier: number } {
    console.log(`BonusCalculationService: Расчет бонусов для ресурса ${resourceId}`);
    
    let productionMultiplier = 1; // Базовый множитель
    
    // Проверка наличия исследований для улучшения знаний
    switch (resourceId) {
      case 'knowledge':
        // Проверяем наличие базовых исследований
        if (state.upgrades['blockchain_basics']?.purchased || 
            state.upgrades['blockchainBasics']?.purchased || 
            state.upgrades['basicBlockchain']?.purchased) {
          productionMultiplier *= 1.1; // +10% к получению знаний
          console.log("BonusCalculationService: Применен бонус Основы блокчейна +10% к знаниям");
        }
        
        // Проверяем наличие интернет-канала для увеличения скорости получения знаний
        if (state.buildings.internetConnection?.count > 0) {
          const internetBonus = 0.2; // +20% к скорости получения знаний
          productionMultiplier *= (1 + internetBonus);
          console.log(`BonusCalculationService: Применен бонус Интернет-канала +${internetBonus * 100}% к знаниям`);
        }
        
        break;
        
      case 'electricity':
        // Добавим бонусы для производства электричества
        if (state.upgrades?.energyEfficiency?.purchased) {
          productionMultiplier *= 1.15; // +15% к производству электричества
          console.log("BonusCalculationService: Применен бонус Энергоэффективности +15% к электричеству");
        }
        break;
        
      case 'computingPower':
        // Бонусы для вычислительной мощности
        if (state.upgrades?.algorithmOptimization?.purchased) {
          productionMultiplier *= 1.15; // +15% к вычислительной мощности
          console.log("BonusCalculationService: Применен бонус Оптимизации алгоритмов +15% к вычислительной мощности");
        }
        
        // Проверяем наличие системы охлаждения
        if (state.buildings.coolingSystem?.count > 0) {
          const coolingBonus = 0.2; // +20% к эффективности вычислений
          productionMultiplier *= (1 + coolingBonus);
          console.log(`BonusCalculationService: Применен бонус Системы охлаждения +${coolingBonus * 100}% к вычислительной мощности`);
        }
        break;
        
      case 'bitcoin':
        // Бонусы для майнинга Bitcoin
        if (state.miningParams?.miningEfficiency > 1) {
          productionMultiplier *= state.miningParams.miningEfficiency;
          console.log(`BonusCalculationService: Применен множитель эффективности майнинга ${state.miningParams.miningEfficiency}`);
        }
        break;
    }
    
    // Возвращаем рассчитанные бонусы
    return { productionMultiplier };
  }

  /**
   * Применяет бонусы от покупки улучшения
   */
  applyUpgradeBonuses(state: GameState, upgradeId: string): GameState {
    console.log(`BonusCalculationService: Применение бонусов от улучшения ${upgradeId}`);
    
    let updatedState = { ...state };
    
    // Логика применения бонусов в зависимости от улучшения
    switch (upgradeId) {
      case 'blockchainBasics':
      case 'blockchain_basics':
      case 'basicBlockchain':
        // Увеличиваем максимум знаний на 50%
        if (updatedState.resources.knowledge) {
          updatedState.resources.knowledge = {
            ...updatedState.resources.knowledge,
            max: updatedState.resources.knowledge.max * 1.5,
            baseProduction: (updatedState.resources.knowledge.baseProduction || 0) + 0.1
          };
          console.log(`BonusCalculationService: Применен бонус "Основы блокчейна": максимум знаний увеличен до ${updatedState.resources.knowledge.max}`);
          console.log(`BonusCalculationService: Применен бонус "Основы блокчейна": базовое производство знаний увеличено до ${updatedState.resources.knowledge.baseProduction}`);
        }
        break;
        
      case 'cryptoCurrencyBasics':
        // Увеличиваем эффективность конвертации знаний в USDT на 10%
        console.log(`BonusCalculationService: Применен бонус "Основы криптовалют": +10% к эффективности конвертации знаний`);
        // Этот эффект учитывается в processApplyKnowledgeAction
        break;
        
      case 'algorithmOptimization':
        // Увеличиваем эффективность майнинга на 15%
        updatedState.miningParams = {
          ...updatedState.miningParams,
          miningEfficiency: (updatedState.miningParams?.miningEfficiency || 1) * 1.15
        };
        console.log(`BonusCalculationService: Применен бонус "Оптимизация алгоритмов": эффективность майнинга увеличена до ${updatedState.miningParams.miningEfficiency}`);
        break;
        
      // Другие улучшения по мере необходимости
    }
    
    return updatedState;
  }

  /**
   * Пересчитывает все бонусы
   */
  recalculateAllBonuses(state: GameState): GameState {
    console.log("BonusCalculationService: Пересчет всех бонусов");
    
    let updatedState = { ...state };
    
    // Применяем эффекты от всех купленных улучшений
    for (const upgradeId in state.upgrades) {
      if (state.upgrades[upgradeId]?.purchased) {
        updatedState = this.applyUpgradeBonuses(updatedState, upgradeId);
      }
    }
    
    return updatedState;
  }
}
