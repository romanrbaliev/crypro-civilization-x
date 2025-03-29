
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksBase } from '@/utils/unlockSystem';

// Проверка условий разблокировки зданий (обертка над функцией из unlockSystem)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий...");
  // Добавим принудительную проверку разблокировки улучшенного кошелька
  if (state.buildings.cryptoWallet && state.buildings.cryptoWallet.count >= 10 && 
      state.buildings.improvedWallet && !state.buildings.improvedWallet.unlocked) {
    console.log("Принудительная разблокировка улучшенного кошелька по количеству обычных кошельков");
    state = {
      ...state,
      buildings: {
        ...state.buildings,
        improvedWallet: {
          ...state.buildings.improvedWallet,
          unlocked: true
        }
      }
    };
    safeDispatchGameEvent("Разблокирован улучшенный кошелек! Теперь вы можете хранить больше криптовалюты.", "info");
  }
  
  return checkBuildingUnlocksBase(state);
};
