import { GameState } from '@/context/types';

// Определение базовых зданий, которые будут разблокированы на фазе 2
const initialPhase2Buildings = {
  cryptoWallet: {
    name: "Криптокошелек",
    description: "Безопасное хранение криптовалюты",
    count: 0,
    baseCost: { usdt: 50 },
    costMultiplier: 1.15,
    baseProduction: { btc: 0.01 },
    productionMultiplier: 1.1,
    unlocked: false
  },
  internetChannel: {
    name: "Интернет-канал",
    description: "Улучшенное подключение к сети",
    count: 0,
    baseCost: { usdt: 120 },
    costMultiplier: 1.2,
    baseProduction: { computingPower: 0.5 },
    productionMultiplier: 1.15,
    unlocked: false
  },
  miner: {
    name: "Майнер",
    description: "Специализированное устройство для майнинга",
    count: 0,
    baseCost: { usdt: 300, electricity: 50 },
    costMultiplier: 1.25,
    baseProduction: { btc: 0.05 },
    productionMultiplier: 1.2,
    unlocked: false
  }
};

/**
 * Разблокирует здания в соответствии с текущей фазой игры
 */
export const unlockBuildingsByPhase = (state: GameState): GameState => {
  const { phase } = state;
  let newState = { ...state };
  
  if (phase === 2) {
    // Разблокируем здания для фазы 2
    const phase2Buildings = { ...initialPhase2Buildings };
    
    // Обновляем состояние зданий
    newState = {
      ...newState,
      buildings: {
        ...newState.buildings,
        ...Object.fromEntries(
          Object.entries(phase2Buildings).map(([id, building]) => [
            id, 
            { ...building, unlocked: true }
          ])
        )
      }
    };
  }
  
  return newState;
};
