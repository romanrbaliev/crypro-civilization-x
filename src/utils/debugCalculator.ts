import { GameState } from '@/context/types';
import { debugUnlockStatus } from './unlockManager';

// Экспортируем функцию для отладки разблокировок
export { debugUnlockStatus };

// Рассчитывает эффективность применения знаний
export function calculateKnowledgeEfficiency(state: GameState): { 
  efficiency: number, 
  baseRate: number,
  bonusRate: number,
  steps: string[] 
} {
  const steps: string[] = [];
  
  // Базовая эффективность (1 USDT за 10 знаний)
  const baseRate = 0.1;
  steps.push(`Базовая эффективность: ${baseRate} USDT за 1 знание`);
  
  // Бонус от исследований
  let bonusRate = 0;
  if (state.upgrades.cryptoCurrencyBasics?.purchased) {
    bonusRate += state.upgrades.cryptoCurrencyBasics.effects.knowledgeEfficiencyBoost || 0;
    steps.push(`Бонус от "Основы криптовалют": +${bonusRate * 100}%`);
  }
  
  // Общая эффективность
  const efficiency = baseRate * (1 + bonusRate);
  steps.push(`Итоговая эффективность: ${efficiency} USDT за 1 знание`);
  
  return {
    efficiency,
    baseRate,
    bonusRate,
    steps
  };
}
