
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
      
      if (newState.buildings.autoMiner) {
        newState.buildings.autoMiner = {
          ...newState.buildings.autoMiner,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          autoMiner: true
        };
        
        console.log("GameStateService: Автомайнер (ID: autoMiner) принудительно разблокирован");
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
        
        console.log("GameStateService: Существующий ресурс Bitcoin разблокирован");
      }
      
      // Устанавливаем флаг разблокировки Bitcoin
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true
      };
      
      return newState;
    }
    
    return state;
  }
  
  /**
   * Выполняет полную синхронизацию состояния
   */
  performFullStateSync(state: GameState): GameState {
    try {
      console.log("GameStateService: Выполняется полная синхронизация состояния");
      
      // Обновляем производство и потребление ресурсов
      let newState = {
        ...state,
        resources: this.resourceProductionService.calculateResourceProduction(state)
      };
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Полная перепроверка всех разблокировок
      newState = this.unlockService.rebuildAllUnlocks(newState);
      
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
   * Обрабатывает покупку здания
   */
  processBuildingPurchase(state: GameState, buildingId: string): GameState {
    try {
      // Обновляем все ресурсы по��ле покупки здания
      let newState = this.updateResourceProduction(state);
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Проверяем все разблокировки
      newState = this.unlockService.checkAllUnlocks(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      return newState;
    } catch (error) {
      console.error("GameStateService: Ошибка при обработке покупки здания", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Обрабатывает покупку улучшения
   */
  processUpgradePurchase(state: GameState, upgradeId: string): GameState {
    try {
      console.log(`GameStateService: Обработка покупки улучшения ${upgradeId}`);
      
      // Обновляем производство ресурсов
      let newState = this.updateResourceProduction(state);
      
      // Проверяем необходимость разблокировки майнера после покупки Основ криптовалют
      if (upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
        console.log("GameStateService: Особая обработка для улучшения 'Основы криптовалют'");
        
        // Принудительно разблокируем майнер по всем возможным ID
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
        
        if (newState.buildings.autoMiner) {
          newState.buildings.autoMiner = {
            ...newState.buildings.autoMiner,
            unlocked: true
          };
          
          newState.unlocks = {
            ...newState.unlocks,
            autoMiner: true
          };
          
          console.log("GameStateService: Автомайнер (ID: autoMiner) принудительно разблокирован");
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
          
          console.log("GameStateService: Существующий ресурс Bitcoin разблокирован");
        }
        
        // Устанавливаем флаг разблокировки Bitcoin
        newState.unlocks = {
          ...newState.unlocks,
          bitcoin: true
        };
        
        // Отправляем уведомление пользователю
        safeDispatchGameEvent("Майнер и Bitcoin разблокированы!", "info");
      }
      
      // Обновляем все максимальные значения ресурсов
      newState = updateResourceMaxValues(newState);
      
      // Обновляем lastUpdate для отслеживания времени
      newState = {
        ...newState,
        lastUpdate: Date.now()
      };
      
      return newState;
    } catch (error) {
      console.error("GameStateService: Ошибка при обработке покупки улучшения", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Обновляет производство ресурсов
   */
  private updateResourceProduction(state: GameState): GameState {
    try {
      // Обновляем все ресурсы на основе их производства
      return {
        ...state,
        resources: this.resourceProductionService.calculateResourceProduction(state)
      };
    } catch (error) {
      console.error("GameStateService: Ошибка при обновлении производства ресурсов", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Проверяет статус оборудования, зависящего от ресурсов
   */
  private checkEquipmentStatus(state: GameState): GameState {
    try {
      // TODO: Проверка статуса оборудования, зависящего от ресурсов
      // Например, отключение майнеров при нехватке электричества
      return state;
    } catch (error) {
      console.error("GameStateService: Ошибка при проверке статуса оборудования", error);
      // В случае ошибки возвращаем исходное состояние
      return state;
    }
  }
  
  /**
   * Рассчитывает максимальное значение для указанного ресурса
   */
  calculateMaxValueForResource(state: GameState, resourceId: string): number {
    let baseMax = 0;
    let additionalMax = 0;
    
    // Определяем базовое значение максимума для разных ресурсов
    switch (resourceId) {
      case 'knowledge':
        baseMax = 100;
        break;
      case 'usdt':
        baseMax = 50;
        break;
      case 'electricity':
        baseMax = 100;
        break;
      case 'computingPower':
        baseMax = 1000;
        break;
      case 'bitcoin':
        baseMax = 0.01;
        break;
      default:
        baseMax = 100;
    }
    
    // Добавляем константные значения от зданий для отдельных ресурсов
    if (resourceId === 'usdt') {
      // Криптокошелек добавляет +50 к макс. USDT
      if (state.buildings.cryptoWallet) {
        const walletCount = state.buildings.cryptoWallet.count || 0;
        additionalMax += 50 * walletCount;
      }
      
      // Улучшенный кошелек добавляет +150 к макс. USDT
      if (state.buildings.improvedWallet) {
        const improvedWalletCount = state.buildings.improvedWallet.count || 0;
        additionalMax += 150 * improvedWalletCount;
      }
    } else if (resourceId === 'bitcoin') {
      // Улучшенный кошелек добавляет +1 к макс. BTC
      if (state.buildings.improvedWallet) {
        const improvedWalletCount = state.buildings.improvedWallet.count || 0;
        additionalMax += 1 * improvedWalletCount;
      }
    } else if (resourceId === 'knowledge') {
      // Библиотека добавляет +100 к макс. знаниям
      if (state.buildings.cryptoLibrary) {
        const libraryCount = state.buildings.cryptoLibrary.count || 0;
        additionalMax += 100 * libraryCount;
      }
    }
    
    // Получаем множитель максимального значения от улучшений и зданий
    const multiplier = this.bonusCalculationService.calculateMaxValueMultiplier(state, resourceId);
    
    // Считаем итоговый максимум ресурса
    let totalMax = baseMax * multiplier + additionalMax;
    
    // Если это знания и есть исследование "Основы блокчейна"
    if (resourceId === 'knowledge') {
      let totalMultiplier = 1.0;
      
      // Проверяем наличие исследования "Основы блокчейна"
      if (state.upgrades.blockchainBasics?.purchased || 
          state.upgrades.basicBlockchain?.purchased || 
          state.upgrades.blockchain_basics?.purchased) {
        // Увеличиваем общий множитель на 50%
        totalMultiplier += 0.5;
        console.log(`GameStateService: Множитель максимума знаний от Основ блокчейна: +50%`);
      }
      
      console.log(`GameStateService: Итоговый множитель максимума знаний: ${totalMultiplier.toFixed(2)}`);
      console.log(`GameStateService: Максимум knowledge: ${totalMax.toFixed(2)} (множитель: ${multiplier.toFixed(2)})`);
    }
    
    return totalMax;
  }
}
