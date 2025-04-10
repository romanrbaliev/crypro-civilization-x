import { GameState } from '@/context/types';
import { ResourceProductionService } from './ResourceProductionService';
import { BonusCalculationService } from './BonusCalculationService';
import { UnlockService } from './UnlockService';
import { updateResourceMaxValues } from '@/context/utils/resourceUtils';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Централизованный сервис для обработки изменений состояния игры
 */
export class GameStateService {
  private resourceProductionService: ResourceProductionService;
  private bonusCalculationService: BonusCalculationService;
  private unlockService: UnlockService;
  
  constructor() {
    this.resourceProductionService = new ResourceProductionService();
    this.bonusCalculationService = new BonusCalculationService();
    this.unlockService = new UnlockService();
  }
  
  /**
   * Обрабатывает обновление состояния игры
   */
  processGameStateUpdate(state: GameState): GameState {
    try {
      // Обновляем ресурсы на основе их производства
      let newState = this.updateResourceProduction(state);
      
      // Проверяем необходимость разблокировки майнера после покупки Основ криптовалют
      newState = this.checkCryptoUpgradeUnlocks(newState);
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Проверяем все разблокировки
      newState = this.unlockService.checkAllUnlocks(newState);
      
      // Принудительно разблокируем критические элементы
      newState = this.forceUnlockCriticalItems(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      console.log("GameStateService: Обработка обновления состояния завершена успешно");
      return newState;
    } catch (error) {
      console.error("GameStateService: Ошибка при обработке обновления состояния", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Обновляем производство ресурсов
   */
  private updateResourceProduction(state: GameState): GameState {
    return {
      ...state,
      resources: this.resourceProductionService.calculateResourceProduction(state)
    };
  }
  
  /**
   * Проверяет необходимость разблокировки майнера и Bitcoin после покупки улучшения Основы криптовалют
   */
  private checkCryptoUpgradeUnlocks(state: GameState): GameState {
    // Проверяем, куплено ли улучшение "Основы криптовалют"
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
      (state.upgrades.cryptoBasics?.purchased === true);
    
    if (hasCryptoBasics) {
      console.log("GameStateService: Обнаружено исследование 'Основы криптовалют', проверяем разблокировку майнера");
      
      let newState = {...state};
      
      // Принудительно разблокируем майнер по всем возможным ID
      // Первый вариант - 'miner'
      if (newState.buildings.miner) {
        newState.buildings.miner = {
          ...newState.buildings.miner,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          miner: true
        };
        
        console.log("GameStateService: Майнер (ID: miner) принудительно разблокирован");
      }
      
      // Второй вариант - 'miningRig'
      if (newState.buildings.miningRig) {
        newState.buildings.miningRig = {
          ...newState.buildings.miningRig,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          miningRig: true
        };
        
        console.log("GameStateService: Майнинг-риг (ID: miningRig) принудительно разблокирован");
      }
      
      // Принудительно разблокируем криптобиблиотеку
      if (newState.buildings.cryptoLibrary) {
        newState.buildings.cryptoLibrary = {
          ...newState.buildings.cryptoLibrary,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          cryptoLibrary: true
        };
        
        console.log("GameStateService: Криптобиблиотека принудительно разблокирована");
      }
      
      // Принудительно разблокируем Bitcoin
      if (!newState.resources.bitcoin) {
        // Создаем ресурс если не существует
        newState.resources.bitcoin = {
          id: 'bitcoin',
          name: 'Bitcoin',
          description: 'Bitcoin - первая и основная криптовалюта',
          type: 'currency',
          icon: 'bitcoin',
          value: 0,
          baseProduction: 0,
          production: 0,
          perSecond: 0,
          max: 0.01,
          unlocked: true
        };
        
        console.log("GameStateService: Ресурс Bitcoin создан");
      } else {
        // Разблокируем существующий ресурс
        newState.resources.bitcoin = {
          ...newState.resources.bitcoin,
          unlocked: true
        };
        
        console.log("GameStateService: Существующий Bitcoin разблокирован");
      }
      
      // Устанавливаем флаг разблокировки Bitcoin
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true
      };
      
      // Теперь проверим, есть ли сам майнер в зданиях
      // Если его нет в списке зданий - добавим базовую версию
      if (!newState.buildings.miner && !newState.buildings.miningRig) {
        console.log("GameStateService: Майнер отсутствует в списке зданий, создаем его");
        
        // Создаем майнер с базовыми параметрами - без свойств, которых нет в интерфейсе Building
        newState.buildings.miner = {
          id: 'miner',
          name: 'Майнер',
          description: 'Автоматически добывает Bitcoin',
          cost: { usdt: 150 },
          costMultiplier: 1.15,
          count: 0,
          unlocked: true,
          type: 'production',
          production: {
            bitcoin: 0.00005
          },
          consumption: {
            electricity: 1,
            computingPower: 5
          },
          productionBoost: 0
        };
      }
      
      return newState;
    }
    
    return state;
  }
  
  /**
   * Принудительно разблокирует критические элементы в игре
   */
  private forceUnlockCriticalItems(state: GameState): GameState {
    let newState = { ...state };
    let hasChanges = false;
    
    // Проверка для Улучшенного кошелька (EnhancedWallet)
    if (newState.buildings.cryptoWallet && newState.buildings.cryptoWallet.count >= 5) {
      if (newState.buildings.enhancedWallet) {
        console.log(`GameStateService: Проверка принудительной разблокировки enhancedWallet. Уровень кошелька: ${newState.buildings.cryptoWallet.count}`);
        
        // Принудительно устанавливаем флаг разблокировки
        if (!newState.buildings.enhancedWallet.unlocked) {
          console.log("GameStateService: Принудительно разблокируем Улучшенный кошелек (enhancedWallet)");
          newState.buildings.enhancedWallet.unlocked = true;
          hasChanges = true;
        }
        
        // Устанавливаем флаг в state.unlocks
        if (!newState.unlocks.enhancedWallet) {
          newState.unlocks = {
            ...newState.unlocks,
            enhancedWallet: true
          };
        }
      }
      
      // Разблокируем альтернативный ID (improvedWallet)
      if (newState.buildings.improvedWallet && !newState.buildings.improvedWallet.unlocked) {
        newState.buildings.improvedWallet.unlocked = true;
        newState.unlocks = {
          ...newState.unlocks,
          improvedWallet: true
        };
        hasChanges = true;
      }
    }
    
    // Проверка для Криптобиблиотеки (CryptoLibrary)
    if (newState.upgrades.cryptoCurrencyBasics && newState.upgrades.cryptoCurrencyBasics.purchased) {
      if (newState.buildings.cryptoLibrary && !newState.buildings.cryptoLibrary.unlocked) {
        console.log("GameStateService: Принудительно разблокируем Криптобиблиотеку (cryptoLibrary)");
        newState.buildings.cryptoLibrary.unlocked = true;
        newState.unlocks = {
          ...newState.unlocks,
          cryptoLibrary: true
        };
        hasChanges = true;
      }
    }
    
    // Проверка для Системы охлаждения (CoolingSystem)
    if (newState.buildings.homeComputer && newState.buildings.homeComputer.count >= 2) {
      if (newState.buildings.coolingSystem && !newState.buildings.coolingSystem.unlocked) {
        console.log("GameStateService: Принудительно разблокируем Систему охлаждения (coolingSystem)");
        newState.buildings.coolingSystem.unlocked = true;
        newState.unlocks = {
          ...newState.unlocks,
          coolingSystem: true
        };
        hasChanges = true;
      }
    }
    
    // Проверка для Крипто-сообщества (CryptoCommunity)
    const hasCryptoBasics = newState.upgrades.cryptoCurrencyBasics?.purchased === true;
    const hasEnoughUsdt = newState.resources.usdt?.value >= 30;
    
    if (hasEnoughUsdt && hasCryptoBasics) {
      if (newState.upgrades.cryptoCommunity && !newState.upgrades.cryptoCommunity.unlocked) {
        console.log("GameStateService: Принудительно разблокируем Крипто-сообщество (cryptoCommunity)");
        newState.upgrades.cryptoCommunity.unlocked = true;
        newState.unlocks = {
          ...newState.unlocks,
          cryptoCommunity: true
        };
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      console.log("GameStateService: Были применены принудительные разблокировки критических элементов");
    }
    
    return newState;
  }
  
  /**
   * Выполняет полную синхронизацию состояния
   */
  performFullStateSync(state: GameState): GameState {
    try {
      console.log("GameStateService: Выполняется полная синхронизация состояния");
      
      // Обновляем производство и потребление ресурсов
      let newState = this.updateResourceProduction(state);
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Полная перепроверка всех разблокировок
      newState = this.unlockService.rebuildAllUnlocks(newState);
      
      // Проверка и принудительная разблокировка особых элементов
      newState = this.forceUnlockCriticalItems(newState);
      
      // Принудительная проверка всех зданий, требующих ресурсы для работы
      newState = this.checkEquipmentStatus(newState);
      
      // Дополнительная проверка разблокировки майнера после покупки Основ криптовалют
      newState = this.checkCryptoUpgradeUnlocks(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      console.log("GameStateService: Полная синхронизация состояния завершена успешно");
      return newState;
    } catch (error) {
      console.error("GameStateService: Ошибка при полной синхронизации состояния", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Проверяет доступность ресурсов для оборудования
   */
  private checkEquipmentStatus(state: GameState): GameState {
    // Пока что просто возвращаем состояние без изменений
    // В будущем здесь можно добавить логику проверки достаточности ресурсов
    return state;
  }
  
  /**
   * Обрабатывает покупку здания
   */
  processBuildingPurchase(state: GameState, buildingId: string): GameState {
    try {
      // Обновляем все ресурсы после покупки здания
      let newState = this.updateResourceProduction(state);
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Принудительно проверяем разблокировки
      newState = this.unlockService.checkAllUnlocks(newState);
      
      // Принудительно разблокируем критические элементы
      newState = this.forceUnlockCriticalItems(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      console.log(`GameStateService: Обработка покупки здания ${buildingId} завершена успешно`);
      return newState;
    } catch (error) {
      console.error(`GameStateService: Ошибка при обработке покупки здания ${buildingId}`, error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Обрабатывает покупку улучшения
   */
  processUpgradePurchase(state: GameState, upgradeId: string): GameState {
    try {
      // Обновляем все ресурсы после покупки улучшения
      let newState = this.updateResourceProduction(state);
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Если это Основы криптовалют, принудительно разблокируем майнер и Bitcoin
      if (upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
        newState = this.checkCryptoUpgradeUnlocks(newState);
      }
      
      // Принудительно проверяем разблокировки
      newState = this.unlockService.checkAllUnlocks(newState);
      
      // Принудительно разблокируем критические элементы
      newState = this.forceUnlockCriticalItems(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      console.log(`GameStateService: Обработка покупки улучшения ${upgradeId} завершена успешно`);
      return newState;
    } catch (error) {
      console.error(`GameStateService: Ошибка при обработке покупки улучшения ${upgradeId}`, error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
}
