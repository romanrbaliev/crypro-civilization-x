
import { GameState } from '@/context/types';

/**
 * Сервис для расчета бонусов и множителей
 */
export class BonusCalculationService {
  
  /**
   * Рассчитывает общий множитель для максимального значения ресурса
   */
  calculateMaxValueMultiplier(state: GameState, resourceId: string): number {
    let multiplier = 1.0;
    
    // Начальные множители для каждого типа ресурса
    switch (resourceId) {
      case 'knowledge':
        multiplier = this.calculateKnowledgeMaxMultiplier(state);
        break;
      case 'usdt':
        multiplier = this.calculateUsdtMaxMultiplier(state);
        break;
      case 'electricity':
        multiplier = this.calculateElectricityMaxMultiplier(state);
        break;
      case 'computingPower':
        multiplier = this.calculateComputingPowerMaxMultiplier(state);
        break;
      case 'bitcoin':
        multiplier = this.calculateBitcoinMaxMultiplier(state);
        break;
      default:
        multiplier = 1.0;
    }
    
    return multiplier;
  }
  
  /**
   * Рассчитывает множитель для максимального значения знаний
   */
  private calculateKnowledgeMaxMultiplier(state: GameState): number {
    let multiplier = 1.0;
    
    // Бонус от улучшения "Основы блокчейна" (+50%)
    if (state.upgrades.blockchainBasics?.purchased) {
      multiplier += 0.5;
    }
    
    // Бонус от криптокошелька (+25% за каждый уровень)
    const walletCount = state.buildings.cryptoWallet?.count || 0;
    multiplier += 0.25 * walletCount;
    
    return multiplier;
  }
  
  /**
   * Рассчитывает множитель для максимального значения USDT
   */
  private calculateUsdtMaxMultiplier(state: GameState): number {
    let multiplier = 1.0;
    
    // Бонус от улучшения "Безопасность криптокошельков" (+25%)
    if (state.upgrades.walletSecurity?.purchased) {
      multiplier += 0.25;
    }
    
    return multiplier;
  }
  
  /**
   * Рассчитывает множитель для максимального значения электричества
   */
  private calculateElectricityMaxMultiplier(state: GameState): number {
    // Базовый множитель
    return 1.0;
  }
  
  /**
   * Рассчитывает множитель для максимального значения вычислительной мощности
   */
  private calculateComputingPowerMaxMultiplier(state: GameState): number {
    // Базовый множитель
    return 1.0;
  }
  
  /**
   * Рассчитывает множитель для максимального значения Bitcoin
   */
  private calculateBitcoinMaxMultiplier(state: GameState): number {
    // Базовый множитель
    return 1.0;
  }
  
  /**
   * Рассчитывает бонус эффективности майнинга
   */
  calculateMiningEfficiencyBonus(state: GameState): number {
    let bonus = 0.0;
    
    // Бонус от улучшения "Оптимизация алгоритмов" (+15%)
    if (state.upgrades.algorithmOptimization?.purchased) {
      bonus += 0.15;
    }
    
    // Бонус от улучшения "Proof of Work" (+25%)
    if (state.upgrades.proofOfWork?.purchased) {
      bonus += 0.25;
    }
    
    // Бонус от специализации "Майнер" (+15%)
    if (state.specialization === 'miner') {
      bonus += 0.15;
    }
    
    // Бонусы от синергий специализаций
    if (state.specializationSynergies) {
      Object.values(state.specializationSynergies)
        .filter(synergy => synergy.active)
        .forEach(synergy => {
          if (synergy.effects && synergy.effects.miningEfficiency) {
            bonus += synergy.effects.miningEfficiency;
          }
        });
    }
    
    return bonus;
  }
  
  /**
   * Рассчитывает бонус энергоэффективности
   */
  calculateEnergyEfficiencyBonus(state: GameState): number {
    let bonus = 0.0;
    
    // Бонус от улучшения "Энергоэффективные компоненты" (+10%)
    if (state.upgrades.energyEfficientComponents?.purchased) {
      bonus += 0.1;
    }
    
    // Бонус от специализации "Майнер" (+10%)
    if (state.specialization === 'miner') {
      bonus += 0.1;
    }
    
    return bonus;
  }
}
