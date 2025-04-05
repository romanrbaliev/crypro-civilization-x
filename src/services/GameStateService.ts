
import { GameState } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Сервис для управления состоянием игры
 */
export class GameStateService {
  
  /**
   * Выполняет полную синхронизацию состояния игры
   * @param state Текущее состояние игры
   * @returns Обновленное состояние игры
   */
  performFullStateSync(state: GameState): GameState {
    console.log('Выполняем полную синхронизацию состояния игры');
    
    const newState = { ...state };
    
    // Обновляем время последнего обновления
    newState.lastUpdate = Date.now();
    
    // Проверяем разблокировки, если игра запущена
    if (newState.gameStarted) {
      newState.unlocks = this.checkAndUpdateUnlocks(newState);
    }
    
    // Обновляем ресурсы
    this.updateResourceProduction(newState);
    
    // Проверяем специальные события
    this.checkSpecialEvents(newState);
    
    return newState;
  }
  
  /**
   * Обрабатывает обновление состояния игры
   * @param state Текущее состояние игры
   * @returns Обновленное состояние игры
   */
  processGameStateUpdate(state: GameState): GameState {
    const newState = { ...state };
    
    // Обновляем ресурсы на основе зданий
    this.updateResourcesBasedOnBuildings(newState);
    
    // Обновляем ограничения ресурсов
    this.updateResourceLimits(newState);
    
    return newState;
  }
  
  /**
   * Обновляет ресурсы на основе зданий
   * @param state Состояние игры для обновления
   */
  private updateResourcesBasedOnBuildings(state: GameState): void {
    // Проходим по всем зданиям и применяем их эффекты на ресурсы
    Object.values(state.buildings).forEach(building => {
      if (building.count > 0) {
        // Применяем производство
        if (building.production) {
          Object.entries(building.production).forEach(([resourceId, amount]) => {
            if (state.resources[resourceId] && state.resources[resourceId].unlocked) {
              state.resources[resourceId].perSecond = (state.resources[resourceId].perSecond || 0) + (amount * building.count);
            }
          });
        }
        
        // Применяем потребление
        if (building.consumption) {
          Object.entries(building.consumption).forEach(([resourceId, amount]) => {
            if (state.resources[resourceId] && state.resources[resourceId].unlocked) {
              state.resources[resourceId].perSecond = (state.resources[resourceId].perSecond || 0) - (amount * building.count);
            }
          });
        }
      }
    });
  }
  
  /**
   * Обновляет лимиты ресурсов на основе зданий и исследований
   * @param state Состояние игры для обновления
   */
  private updateResourceLimits(state: GameState): void {
    // Сбрасываем лимиты к базовым значениям
    Object.keys(state.resources).forEach(resourceId => {
      const resource = state.resources[resourceId];
      if (resource.unlocked) {
        // Базовые лимиты для разных ресурсов
        switch (resourceId) {
          case 'knowledge':
            resource.max = 100; // Базовый лимит для знаний
            break;
          case 'usdt':
            resource.max = 500; // Базовый лимит для USDT
            break;
          case 'electricity':
            resource.max = 1000; // Базовый лимит для электричества
            break;
          case 'computingPower':
            resource.max = 1000; // Базовый лимит для вычислительной мощности
            break;
          case 'bitcoin':
            resource.max = 1; // Базовый лимит для биткоина
            break;
          default:
            resource.max = 100; // Стандартный лимит
        }
      }
    });
    
    // Применяем модификаторы от зданий
    Object.values(state.buildings).forEach(building => {
      if (building.count > 0 && building.effects) {
        Object.entries(building.effects).forEach(([effectId, value]) => {
          // Проверяем эффекты увеличения максимума ресурсов
          if (effectId.startsWith('max') && effectId.length > 3) {
            const resourceId = effectId.substring(3).toLowerCase();
            if (state.resources[resourceId] && state.resources[resourceId].unlocked) {
              state.resources[resourceId].max += value * building.count;
            }
          }
        });
      }
    });
    
    // Применяем модификаторы от исследований
    Object.values(state.upgrades).forEach(upgrade => {
      if (upgrade.purchased && upgrade.effects) {
        Object.entries(upgrade.effects).forEach(([effectId, value]) => {
          // Проверяем эффекты увеличения максимума ресурсов
          if (effectId.startsWith('max') && effectId.length > 3) {
            const resourceId = effectId.substring(3).toLowerCase();
            if (state.resources[resourceId] && state.resources[resourceId].unlocked) {
              state.resources[resourceId].max += value;
            }
          }
        });
      }
    });
  }
  
  /**
   * Проверяет и обновляет разблокировки
   * @param state Текущее состояние игры
   * @returns Обновленные разблокировки
   */
  private checkAndUpdateUnlocks(state: GameState): { [key: string]: boolean } {
    const unlocks = { ...state.unlocks };
    
    // Здесь логика проверки разблокировок
    // Например, базовые разблокировки в начале игры
    
    if (!unlocks.applyKnowledge && (state.counters.learnButtonClicks?.value || 0) >= 3) {
      unlocks.applyKnowledge = true;
      safeDispatchGameEvent('Разблокировано: "Применить знания"', 'success');
    }
    
    if (!unlocks.practice && (state.counters.applyKnowledgeButtonClicks?.value || 0) >= 2) {
      unlocks.practice = true;
      safeDispatchGameEvent('Разблокировано: "Практика"', 'success');
    }
    
    // Добавьте другие проверки разблокировок по мере необходимости
    
    return unlocks;
  }
  
  /**
   * Обновляет производство ресурсов
   * @param state Текущее состояние игры
   */
  private updateResourceProduction(state: GameState): void {
    // Здесь логика расчета производства ресурсов
    // Обновляем perSecond для всех ресурсов
    
    // Пример: обновление производства знаний на основе зданий
    let knowledgePerSecond = state.resources.knowledge?.baseProduction || 0;
    
    // Добавляем производство от "Практики"
    if (state.buildings.practice && state.buildings.practice.unlocked) {
      const practiceCount = state.buildings.practice.count || 0;
      knowledgePerSecond += practiceCount * 1; // 1 знание за каждую практику
    }
    
    // Устанавливаем новое значение производства
    if (state.resources.knowledge) {
      state.resources.knowledge.perSecond = knowledgePerSecond;
    }
  }
  
  /**
   * Проверяет специальные события
   * @param state Текущее состояние игры
   */
  private checkSpecialEvents(state: GameState): void {
    // Здесь логика проверки и обработки специальных событий
    // Например, достижение определенных порогов, случайные события и т.д.
  }
}
