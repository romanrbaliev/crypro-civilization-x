
import { GameState } from '@/context/types';
import { ResourceProductionService } from './ResourceProductionService';
import { BonusCalculationService } from './BonusCalculationService';
import { UnlockService } from './UnlockService';

/**
 * Централизованный сервис для управления состоянием игры
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
   * Обработка общего обновления состояния игры
   */
  processGameStateUpdate(state: GameState): GameState {
    console.log("GameStateService: Начало обработки обновления состояния");
    
    try {
      // Проверить разблокировки через UnlockService
      state = this.unlockService.checkAllUnlocks(state);
      
      // Обновить максимальные значения ресурсов
      state = this.updateResourceMaxValues(state);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(state);
      
      // Объединить обновленные ресурсы с состоянием
      state = {
        ...state,
        resources: updatedResources
      };
      
      // Принудительная проверка условий для критических разблокировок
      if (state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 1) {
        // Проверяем и разблокируем USDT, если счетчик applyKnowledge >= 1
        if (!state.resources.usdt || !state.resources.usdt.unlocked) {
          console.log("GameStateService: Принудительная проверка разблокировки USDT");
          // Обновляем ресурс USDT
          const updatedResources = { ...state.resources };
          if (!updatedResources.usdt) {
            updatedResources.usdt = {
              id: 'usdt',
              name: 'USDT',
              description: 'Стейблкоин, привязанный к стоимости доллара США',
              value: 0,
              baseProduction: 0,
              production: 0,
              perSecond: 0,
              max: 50,
              unlocked: true,
              type: 'currency',
              icon: 'dollar'
            };
          } else {
            updatedResources.usdt = {
              ...updatedResources.usdt,
              unlocked: true
            };
          }
          state = {
            ...state,
            resources: updatedResources,
            unlocks: {
              ...state.unlocks,
              usdt: true
            }
          };
          console.log("GameStateService: USDT принудительно разблокирован:", state.resources.usdt);
        }
      }
      
      if (state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 2 &&
          (!state.buildings.practice || !state.buildings.practice.unlocked)) {
        console.log("GameStateService: Применение принудительной проверки разблокировки практики");
        state = this.unlockService.checkAllUnlocks(state);
      }
      
      if (state.resources.usdt && state.resources.usdt.value >= 11 &&
          (!state.buildings.generator || !state.buildings.generator.unlocked)) {
        console.log("GameStateService: Применение принудительной прове��ки разблокировки генератора");
        state = this.unlockService.checkAllUnlocks(state);
      }
      
      console.log("GameStateService: Обработка обновления состояния завершена успешно");
      return state;
    } catch (error) {
      console.error("GameStateService: Ошибка при обработке обновления состояния", error);
      return state;
    }
  }
  
  /**
   * Обработка покупки здания
   */
  processBuildingPurchase(state: GameState, buildingId: string): GameState {
    console.log(`GameStateService: Обработка покупки здания ${buildingId}`);
    
    try {
      // Проверить разблокировки через UnlockService
      state = this.unlockService.checkAllUnlocks(state);
      
      // Обновить максимальные значения ресурсов
      state = this.updateResourceMaxValues(state);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(state);
      
      // Объединить обновленные ресурсы с состоянием
      state = {
        ...state,
        resources: updatedResources
      };
      
      console.log(`GameStateService: Обработка покупки здания ${buildingId} завершена успешно`);
      return state;
    } catch (error) {
      console.error(`GameStateService: Ошибка при обработке покупки здания ${buildingId}`, error);
      return state;
    }
  }
  
  /**
   * Обработка покупки улучшения
   */
  processUpgradePurchase(state: GameState, upgradeId: string): GameState {
    console.log(`GameStateService: Обработка покупки улучшения ${upgradeId}`);
    
    try {
      // Проверить разблокировки через UnlockService
      let newState = this.unlockService.checkAllUnlocks(state);
      
      // Особая обработка для "Основы криптовалют" - принудительная разблокировка майнера
      if ((upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') && 
          (newState.buildings.miner || newState.buildings.autoMiner)) {
        console.log("GameStateService: Принудительная разблокировка майнера");
        
        // Разблокируем майнер по обоим возможным ID
        if (newState.buildings.miner) {
          newState.buildings.miner = {
            ...newState.buildings.miner,
            unlocked: true
          };
          
          newState.unlocks = {
            ...newState.unlocks,
            miner: true
          };
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
        }
        
        console.log("GameStateService: Майнер принудительно разблокирован");
      }
      
      // Обновить максимальные значения ресурсов
      newState = this.updateResourceMaxValues(newState);
      
      // Пересчитать бонусы
      newState = this.bonusCalculationService.applyUpgradeBonuses(newState, upgradeId);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(newState);
      
      // Объединить обновленные ресурсы с состоянием
      newState = {
        ...newState,
        resources: updatedResources
      };
      
      console.log(`GameStateService: Обработка покупки улучшения ${upgradeId} завершена успешно`);
      return newState;
    } catch (error) {
      console.error(`GameStateService: Ошибка при обработке покупки улучшения ${upgradeId}`, error);
      return state;
    }
  }
  
  /**
   * Выполняет полную синхронизацию состояния, включая пересчет всех параметров
   */
  performFullStateSync(state: GameState): GameState {
    console.log("GameStateService: Выполнение полной синхронизации состояния");
    
    try {
      // Логируем счетчики перед обработкой
      console.log("GameStateService: Текущие счетчики:", {
        applyKnowledge: state.counters.applyKnowledge?.value,
        knowledgeClicks: state.counters.knowledgeClicks?.value
      });
      
      // Логируем состояние ресурсов перед обработкой
      console.log("GameStateService: Текущие ресурсы:", {
        knowledge: state.resources.knowledge?.value,
        usdt: state.resources.usdt?.value,
        usdtUnlocked: state.resources.usdt?.unlocked
      });
      
      // Перестроить разблокировки с нуля через UnlockService
      state = this.unlockService.rebuildAllUnlocks(state);
      
      // Обновить максимальные значения ресурсов
      state = this.updateResourceMaxValues(state);
      
      // Пересчитать все бонусы
      state = this.bonusCalculationService.recalculateAllBonuses(state);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(state);
      
      // Объединить обновленные ресурсы с состоянием
      state = {
        ...state,
        resources: updatedResources
      };
      
      // Проверяем, должен ли быть разблокирован USDT
      if (state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 1) {
        console.log("GameStateService: Принудительная разблокировка USDT в performFullStateSync");
        if (state.resources.usdt) {
          state.resources.usdt.unlocked = true;
        }
        state.unlocks.usdt = true;
      }
      
      // Логируем итоговое состояние после полной синхронизации
      console.log("GameStateService: Состояние после полной синхронизации:", {
        applyKnowledge: state.counters.applyKnowledge?.value,
        usdt: state.resources.usdt?.value,
        usdtUnlocked: state.resources.usdt?.unlocked
      });
      
      console.log("GameStateService: Полная синхронизация состояния завершена успешно");
      return state;
    } catch (error) {
      console.error("GameStateService: Ошибка при полной синхронизации состояния", error);
      return state;
    }
  }
  
  /**
   * Пересчитывает производство ресурсов
   */
  private recalculateResources(state: GameState): { [key: string]: any } {
    try {
      return this.resourceProductionService.calculateResourceProduction(state);
    } catch (error) {
      console.error("GameStateService: Ошибка при пересчете производства ресурсов", error);
      return state.resources;
    }
  }
  
  /**
   * Обновляет максимальные значения ресурсов на основе зданий и улучшений
   */
  private updateResourceMaxValues(state: GameState): GameState {
    const updatedResources = { ...state.resources };
    
    // Обновляем макс. значение USDT на основе количества криптокошельков
    if (updatedResources.usdt) {
      const cryptoWalletCount = state.buildings.cryptoWallet?.count || 0;
      const improvedWalletCount = state.buildings.improvedWallet?.count || 0;
      
      // Базовый максимум + увеличение от криптокошельков + увеличение от улучшенных кошельков
      const defaultMaxUsdt = 50;
      const walletBonus = cryptoWalletCount * 50;
      const improvedWalletBonus = improvedWalletCount * 150;
      
      updatedResources.usdt.max = defaultMaxUsdt + walletBonus + improvedWalletBonus;
      console.log(`GameStateService: Обновлен максимум USDT: ${updatedResources.usdt.max} (база: ${defaultMaxUsdt}, кошельки: +${walletBonus}, улучшенные: +${improvedWalletBonus})`);
    }
    
    // Обновляем макс. значение знаний
    if (updatedResources.knowledge) {
      // Получаем базовое значение
      let baseMaxKnowledge = 100;
      let totalMultiplier = 1.0;
      
      // Проверяем наличие исследования "Основы блокчейна"
      if (state.upgrades.blockchainBasics?.purchased || 
          state.upgrades.basicBlockchain?.purchased || 
          state.upgrades.blockchain_basics?.purchased) {
        // Увеличиваем общий множитель на 50%
        totalMultiplier += 0.5;
        console.log(`GameStateService: Множитель максимума знаний от Основ блокчейна: +50%`);
      }
      
      // Учитываем бонус от криптокошельков (+25% каждый)
      const cryptoWalletCount = state.buildings.cryptoWallet?.count || 0;
      if (cryptoWalletCount > 0) {
        const walletBonus = 0.25 * cryptoWalletCount;
        totalMultiplier += walletBonus;
        console.log(`GameStateService: Множитель максимума знаний от Криптокошельков: +${walletBonus * 100}%`);
      }
      
      // Добавляем бонус от криптобиблиотек (фиксированное значение)
      const cryptoLibraryCount = state.buildings.cryptoLibrary?.count || 0;
      const libraryBonus = cryptoLibraryCount * 100;
      
      // Рассчитываем итоговый максимум
      const finalMax = (baseMaxKnowledge * totalMultiplier) + libraryBonus;
      updatedResources.knowledge.max = finalMax;
      
      console.log(`GameStateService: Обновлен максимум знаний: ${finalMax} (база: ${baseMaxKnowledge}, множитель: ${totalMultiplier}, библиотеки: +${libraryBonus})`);
    }
    
    return {
      ...state,
      resources: updatedResources
    };
  }
}
