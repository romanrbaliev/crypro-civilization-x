
import { GameState } from '@/context/types';
import { UnlockManagerService } from '@/services/UnlockManagerService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Принудительно проверяет и применяет все разблокировки
 */
export function forceCheckAllUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Принудительная проверка всех разблокировок");
  
  // Начинаем с проверки специальных разблокировок
  let updatedState = UnlockManagerService.checkSpecialUnlocks(state);
  
  // Затем проверяем все остальные разблокировки
  updatedState = UnlockManagerService.checkAllUnlocks(updatedState);
  
  // Исправляем ситуации, когда разблокировки не синхронизированы
  if (updatedState.buildings.generator?.count > 0 && !updatedState.unlocks.research) {
    console.log("UnlockActions: Корректировка разблокировки исследований");
    
    updatedState = {
      ...updatedState,
      unlocks: {
        ...updatedState.unlocks,
        research: true
      }
    };
    
    safeDispatchGameEvent("Разблокирована вкладка исследований!", "success");
  }
  
  return updatedState;
}

/**
 * Проверяет и принудительно применяет разблокировку продвинутых зданий и компонентов
 */
export function forceCheckAdvancedUnlocks(state: GameState): GameState {
  console.log("UnlockActions: Проверка разблокировок продвинутых компонентов");
  
  let updatedState = { ...state };
  let buildingsChanged = false;
  let unlocksChanged = false;
  
  // Проверка разблокировки криптобиблиотеки
  if (UnlockManagerService.checkCryptoLibraryUnlock(state)) {
    console.log("UnlockActions: Принудительная разблокировка криптобиблиотеки");
    
    if (updatedState.buildings.cryptoLibrary) {
      updatedState.buildings.cryptoLibrary = {
        ...updatedState.buildings.cryptoLibrary,
        unlocked: true
      };
      
      updatedState.unlocks = {
        ...updatedState.unlocks,
        cryptoLibrary: true
      };
      
      buildingsChanged = true;
      unlocksChanged = true;
      safeDispatchGameEvent("Разблокирована криптобиблиотека", "success");
    }
  }
  
  // Проверка разблокировки системы охлаждения
  if (UnlockManagerService.checkCoolingSystemUnlock(state)) {
    console.log("UnlockActions: Принудительная разблокировка системы охлаждения");
    
    if (updatedState.buildings.coolingSystem) {
      updatedState.buildings.coolingSystem = {
        ...updatedState.buildings.coolingSystem,
        unlocked: true
      };
      
      updatedState.unlocks = {
        ...updatedState.unlocks,
        coolingSystem: true
      };
      
      buildingsChanged = true;
      unlocksChanged = true;
      safeDispatchGameEvent("Разблокирована система охлаждения", "success");
    }
  }
  
  // Проверка разблокировки улучшенного кошелька
  if (UnlockManagerService.checkEnhancedWalletUnlock(state)) {
    console.log("UnlockActions: Принудительная разблокировка улучшенного кошелька");
    
    if (updatedState.buildings.enhancedWallet) {
      updatedState.buildings.enhancedWallet = {
        ...updatedState.buildings.enhancedWallet,
        unlocked: true
      };
      
      updatedState.unlocks = {
        ...updatedState.unlocks,
        enhancedWallet: true
      };
      
      buildingsChanged = true;
      unlocksChanged = true;
      safeDispatchGameEvent("Разблокирован улучшенный кошелек", "success");
    }
    
    if (updatedState.buildings.improvedWallet) {
      updatedState.buildings.improvedWallet = {
        ...updatedState.buildings.improvedWallet,
        unlocked: true
      };
      
      updatedState.unlocks = {
        ...updatedState.unlocks,
        improvedWallet: true
      };
      
      buildingsChanged = true;
      unlocksChanged = true;
    }
  }
  
  if (!buildingsChanged && !unlocksChanged) {
    return state;
  }
  
  console.log("UnlockActions: Применены принудительные разблокировки");
  return updatedState;
}
