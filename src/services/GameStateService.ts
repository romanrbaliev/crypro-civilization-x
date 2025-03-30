
import { GameState } from '@/context/types';
import { UnlockService } from './UnlockService';
import { EffectService } from './EffectService';
import { ResourceCalculationService } from './ResourceCalculationService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Централизованный сервис для управления состоянием игры.
 * Координирует работу других сервисов и обеспечивает корректный порядок выполнения операций.
 */
export class GameStateService {
  private unlockService: UnlockService;
  private effectService: EffectService;
  private resourceCalculationService: ResourceCalculationService;

  constructor() {
    this.unlockService = new UnlockService();
    this.effectService = new EffectService();
    this.resourceCalculationService = new ResourceCalculationService();
  }

  /**
   * Обновляет состояние игры после любого игрового действия.
   * Правильная последовательность: применение эффектов -> проверка разблокировок -> пересчет ресурсов
   */
  public processGameStateUpdate(state: GameState): GameState {
    console.log('GameStateService: Начало обработки обновления состояния');
    
    try {
      // 1. Применяем все эффекты
      const stateWithEffects = this.effectService.applyAllEffects(state);
      
      // 2. Проверяем и применяем все разблокировки
      const stateWithUnlocks = this.unlockService.checkAllUnlocks(stateWithEffects);
      
      // 3. Пересчитываем все ресурсы и их производство
      const finalState = this.resourceCalculationService.recalculateAllResources(stateWithUnlocks);
      
      console.log('GameStateService: Обработка обновления состояния завершена успешно');
      return finalState;
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
    
    // Применяем эффекты конкретно для этого здания
    let newState = this.effectService.applyBuildingEffects(state, buildingId);
    
    // Затем проводим полное обновление состояния
    return this.processGameStateUpdate(newState);
  }

  /**
   * Обрабатывает состояние после покупки исследования
   */
  public processUpgradePurchase(state: GameState, upgradeId: string): GameState {
    console.log(`GameStateService: Обработка покупки исследования ${upgradeId}`);
    
    // Применяем эффекты конкретно для этого исследования
    let newState = this.effectService.applyUpgradeEffects(state, upgradeId);
    
    // Затем проводим полное обновление состояния
    return this.processGameStateUpdate(newState);
  }

  /**
   * Выполняет полную синхронизацию и обновление состояния
   * Вызывается при загрузке игры или других критических моментах
   */
  public performFullStateSync(state: GameState): GameState {
    console.log('GameStateService: Выполнение полной синхронизации состояния');
    
    // 1. Сначала применяем все эффекты от всех исследований и зданий
    let newState = this.effectService.rebuildAllEffects(state);
    
    // 2. Затем проверяем все возможные разблокировки
    newState = this.unlockService.rebuildAllUnlocks(newState);
    
    // 3. Наконец, полностью пересчитываем все ресурсы
    newState = this.resourceCalculationService.rebuildAllResources(newState);
    
    console.log('GameStateService: Полная синхронизация состояния завершена');
    
    return newState;
  }
}
