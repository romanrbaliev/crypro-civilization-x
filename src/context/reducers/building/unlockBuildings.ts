
import { GameState } from '../../types';
import { safeDispatchGameEvent } from '../../utils/eventBusUtils';
import { checkBuildingUnlocks as checkBuildingUnlocksBase } from '@/utils/unlockSystem';

// Проверка условий разблокировки зданий (обертка над функцией из unlockSystem)
export const checkBuildingUnlocks = (state: GameState): GameState => {
  console.log("Проверка разблокировки зданий...");
  
  // Добавляем дополнительную проверку для криптокошелька
  if (state.buildings.cryptoWallet && !state.buildings.cryptoWallet.unlocked) {
    // Проверяем все возможные ID исследования "Основы блокчейна"
    const isBlockchainBasicsPurchased = (
      (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased) ||
      (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) ||
      (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased)
    );
    
    if (isBlockchainBasicsPurchased) {
      console.log("Принудительная разблокировка криптокошелька по наличию исследования 'Основы блокчейна'");
      state = {
        ...state,
        buildings: {
          ...state.buildings,
          cryptoWallet: {
            ...state.buildings.cryptoWallet,
            unlocked: true
          }
        }
      };
      safeDispatchGameEvent("Разблокирован криптокошелек! Теперь вы можете хранить больше криптовалюты.", "info");
    }
  }
  
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
