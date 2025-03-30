
import { GameState } from '@/context/types';
import { ResourceProductionService } from './ResourceProductionService';
import { BonusCalculationService } from './BonusCalculationService';
import { UnlockService } from './UnlockService';
import { checkAllUnlocks } from '@/utils/unlockManager';

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
      // Используем централизованную систему разблокировок из unlockManager
      state = checkAllUnlocks(state);
      
      // Обновить максимальные значения ресурсов
      state = this.updateResourceMaxValues(state);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(state);
      
      // Объединить обновленные ресурсы с состоянием
      state = {
        ...state,
        resources: updatedResources
      };
      
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
      // Используем централизованную систему разблокировок из unlockManager
      state = checkAllUnlocks(state);
      
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
      // Используем централизованную систему разблокировок из unlockManager
      state = checkAllUnlocks(state);
      
      // Обновить максимальные значения ресурсов
      state = this.updateResourceMaxValues(state);
      
      // Пересчитать бонусы
      state = this.bonusCalculationService.applyUpgradeBonuses(state, upgradeId);
      
      // Пересчитать производство ресурсов
      const updatedResources = this.recalculateResources(state);
      
      // Объединить обновленные ресурсы с состоянием
      state = {
        ...state,
        resources: updatedResources
      };
      
      console.log(`GameStateService: Обработка покупки улучшения ${upgradeId} завершена успешно`);
      return state;
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
      // Используем централизованную систему разблокировок из unlockManager
      state = checkAllUnlocks(state);
      
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
      const walletBonus = 25;
      const improvedWalletBonus = 50;
      
      updatedResources.usdt.max = defaultMaxUsdt + 
        (cryptoWalletCount * walletBonus) + 
        (improvedWalletCount * improvedWalletBonus);
    }
    
    // Обновляем макс. значение знаний на основе криптобиблиотек
    if (updatedResources.knowledge) {
      const libraryCount = state.buildings.cryptoLibrary?.count || 0;
      const cryptoWalletCount = state.buildings.cryptoWallet?.count || 0;
      
      // Базовый максимум + увеличение от библиотек + увеличение от криптокошельков
      const defaultMaxKnowledge = 100;
      const libraryBonus = 100;
      const walletKnowledgeBonus = 25;
      
      updatedResources.knowledge.max = defaultMaxKnowledge + 
        (libraryCount * libraryBonus) + 
        (cryptoWalletCount * walletKnowledgeBonus);
      
      // Бонус от исследований
      const blockchainBasicsPurchased = state.upgrades.blockchainBasics?.purchased || 
                                       state.upgrades.blockchain_basics?.purchased ||
                                       state.upgrades.basicBlockchain?.purchased;
      
      if (blockchainBasicsPurchased) {
        updatedResources.knowledge.max *= 1.5; // +50% к максимуму знаний
      }
    }
    
    // Обновляем макс. значение электричества на основе генераторов
    if (updatedResources.electricity) {
      const generatorCount = state.buildings.generator?.count || 0;
      
      // Базовый максимум + увеличение от количества генераторов
      const defaultMaxElectricity = 1000;
      const generatorCapacityBonus = 500; 
      
      updatedResources.electricity.max = defaultMaxElectricity + 
        (generatorCount * generatorCapacityBonus);
    }
    
    // Обновляем максимальные значения других ресурсов при необходимости
    
    return {
      ...state,
      resources: updatedResources
    };
  }
}
