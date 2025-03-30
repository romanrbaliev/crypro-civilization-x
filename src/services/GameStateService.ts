
import { GameState } from '@/context/types';
import { UnlockService } from './UnlockService';
import { ResourceProductionService } from './ResourceProductionService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { BonusCalculationService } from './BonusCalculationService';

/**
 * Централизованный сервис для управления состоянием игры.
 * Координирует работу других сервисов и обеспечивает корректный порядок выполнения операций.
 */
export class GameStateService {
  private unlockService: UnlockService;
  private resourceProductionService: ResourceProductionService;
  private bonusCalculationService: BonusCalculationService;

  constructor() {
    this.unlockService = new UnlockService();
    this.resourceProductionService = new ResourceProductionService();
    this.bonusCalculationService = new BonusCalculationService();
  }

  /**
   * Обновляет состояние игры после любого игрового действия.
   * Правильная последовательность: проверка разблокировок -> расчет бонусов -> пересчет ресурсов
   */
  public processGameStateUpdate(state: GameState): GameState {
    console.log('GameStateService: Начало обработки обновления состояния');
    
    try {
      // 1. Проверяем и применяем все разблокировки
      let newState = this.unlockService.checkAllUnlocks(state);
      
      // 2. Обновляем максимальные значения ресурсов на основе бонусов
      newState = this.updateResourceMaxValues(newState);
      
      // 3. Пересчитываем все ресурсы и их производство
      newState = this.recalculateAllResources(newState);
      
      console.log('GameStateService: Обработка обновления состояния завершена успешно');
      return newState;
    } catch (error) {
      console.error('GameStateService: Ошибка при обработке состояния:', error);
      safeDispatchGameEvent('Произошла ошибка при обновлении игрового состояния', 'error');
      return state; // Возвращаем исходное состояние в случае ошибки
    }
  }

  /**
   * Обрабатывает состояние после покупки здания
   */
  public processBuildingPurchase(state: GameState, buildingId: string): GameState {
    console.log(`GameStateService: Обработка покупки здания ${buildingId}`);
    
    // Проводим полное обновление состояния
    return this.processGameStateUpdate(state);
  }

  /**
   * Обрабатывает состояние после покупки исследования
   */
  public processUpgradePurchase(state: GameState, upgradeId: string): GameState {
    console.log(`GameStateService: Обработка покупки исследования ${upgradeId}`);
    
    // Проводим полное обновление состояния
    return this.processGameStateUpdate(state);
  }

  /**
   * Выполняет полную синхронизацию и обновление состояния
   * Вызывается при загрузке игры или других критических моментах
   */
  public performFullStateSync(state: GameState): GameState {
    console.log('GameStateService: Выполнение полной синхронизации состояния');
    
    try {
      // 1. Сначала проверяем все возможные разблокировки
      let newState = this.unlockService.rebuildAllUnlocks(state);
      
      // 2. Обновляем максимальные значения ресурсов на основе бонусов
      newState = this.updateResourceMaxValues(newState);
      
      // 3. Наконец, полностью пересчитываем все ресурсы
      newState = this.recalculateAllResources(newState);
      
      console.log('GameStateService: Полная синхронизация состояния завершена');
      
      return newState;
    } catch (error) {
      console.error('GameStateService: Ошибка при полной синхронизации:', error);
      safeDispatchGameEvent('Произошла ошибка при синхронизации состояния игры', 'error');
      return state;
    }
  }

  /**
   * Пересчитывает значения всех ресурсов
   */
  private recalculateAllResources(state: GameState): GameState {
    console.log('GameStateService: Пересчет всех ресурсов');
    
    // Используем ResourceProductionService для расчета производства
    const resources = this.resourceProductionService.calculateResourceProduction(state);
    
    // Обновляем значения ресурсов с учетом прошедшего времени
    if (state.lastUpdate) {
      const now = Date.now();
      const elapsedSeconds = (now - state.lastUpdate) / 1000;
      
      if (elapsedSeconds > 0 && state.gameStarted) {
        // Обновляем значения каждого ресурса
        for (const resourceId in resources) {
          const resource = resources[resourceId];
          if (!resource.unlocked) continue;
          
          // Рассчитываем новое значение на основе производства за секунду
          let newValue = resource.value + resource.perSecond * elapsedSeconds;
          
          // Ограничиваем максимумом
          if (resource.max !== undefined && resource.max !== Infinity) {
            newValue = Math.min(newValue, resource.max);
          }
          
          // Обновляем значение ресурса (не позволяем опуститься ниже нуля)
          resource.value = Math.max(0, newValue);
          
          // Если ресурс достиг максимума, и это важно для игрока - уведомляем
          if (resource.perSecond > 0 && newValue >= resource.max && resource.max !== Infinity) {
            console.log(`Ресурс ${resource.name} достиг максимума (${resource.max})!`);
          }
        }
        
        return {
          ...state,
          resources,
          lastUpdate: now,
          gameTime: state.gameTime + elapsedSeconds
        };
      }
    }
    
    // Если обновление времени не требуется, просто обновляем ресурсы
    return {
      ...state,
      resources
    };
  }

  /**
   * Обновляет максимальные значения ресурсов на основе бонусов
   */
  private updateResourceMaxValues(state: GameState): GameState {
    console.log('GameStateService: Обновление максимальных значений ресурсов');
    
    const resources = { ...state.resources };
    
    // Базовые значения для максимума ресурсов
    const baseMaxValues = {
      knowledge: 100,
      usdt: 50,
      electricity: 100,
      computingPower: 1000,
      bitcoin: 0.01,
      btc: 100 // Legacy reference
    };
    
    // Для каждого ресурса рассчитываем максимальное значение с учетом бонусов
    for (const resourceId in resources) {
      if (!resources[resourceId].unlocked) continue;
      
      // Базовое значение максимума
      const baseMax = baseMaxValues[resourceId] || 100;
      
      // Дополнительное значение от зданий
      let buildingAddition = 0;
      
      // Особая обработка для криптокошелька
      if (state.buildings.cryptoWallet?.count > 0) {
        if (resourceId === 'usdt') {
          buildingAddition += 50 * state.buildings.cryptoWallet.count;
        }
      }
      
      // Особая обработка для улучшенного кошелька
      if (state.buildings.improvedWallet?.count > 0) {
        if (resourceId === 'usdt') {
          buildingAddition += 150 * state.buildings.improvedWallet.count;
        } else if (resourceId === 'bitcoin') {
          buildingAddition += 0.1 * state.buildings.improvedWallet.count;
        }
      }
      
      // Рассчитываем процентный бонус от улучшений и зданий
      const bonuses = this.bonusCalculationService.calculateResourceBonuses(state, resourceId);
      
      // Применяем процентный бонус к сумме базового значения и дополнений
      const maxValue = (baseMax + buildingAddition) * bonuses.storageMultiplier;
      
      // Обновляем максимальное значение ресурса
      resources[resourceId] = {
        ...resources[resourceId],
        max: maxValue
      };
      
      console.log(`Итоговый максимум ${resourceId}: ${maxValue.toFixed(2)} (база: ${baseMax}, от зданий: ${buildingAddition}, процентный бонус: ${(bonuses.storageMultiplier - 1).toFixed(2)})`);
    }
    
    return {
      ...state,
      resources
    };
  }
}
