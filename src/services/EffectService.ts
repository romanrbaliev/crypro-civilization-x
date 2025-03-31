
import { GameState } from '@/context/types';
import { ResourceProductionService } from './ResourceProductionService';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

/**
 * Сервис для применения эффектов от зданий и исследований.
 * Централизует всю логику применения эффектов и обеспечивает их правильный учет.
 */
export class EffectService {
  private resourceProductionService: ResourceProductionService;

  constructor() {
    this.resourceProductionService = new ResourceProductionService();
  }

  /**
   * Применяет все возможные эффекты к состоянию игры
   */
  public applyAllEffects(state: GameState): GameState {
    console.log('EffectService: Применение всех эффектов');
    
    // Создаем копию состояния для изменения
    let newState = { ...state };
    
    // Применяем эффекты от всех купленных исследований
    newState = this.applyAllUpgradeEffects(newState);
    
    // Применяем эффекты от всех зданий
    newState = this.applyAllBuildingEffects(newState);
    
    // Применяем эффекты специализации
    if (newState.specialization) {
      newState = this.applySpecializationEffects(newState);
    }
    
    return newState;
  }

  /**
   * Полностью перестраивает все эффекты с нуля
   */
  public rebuildAllEffects(state: GameState): GameState {
    console.log('EffectService: Полная перестройка эффектов');
    
    // Сначала сбрасываем все накопленные эффекты
    let newState = this.resetAllEffects(state);
    
    // Затем применяем все эффекты заново
    return this.applyAllEffects(newState);
  }

  /**
   * Применяет эффекты от конкретного здания
   */
  public applyBuildingEffects(state: GameState, buildingId: string): GameState {
    console.log(`EffectService: Применение эффектов от здания ${buildingId}`);
    
    const building = state.buildings[buildingId];
    if (!building || building.count <= 0) {
      return state;
    }
    
    let newState = { ...state };
    
    // Специфичные эффекты для разных зданий обрабатываются в BonusCalculationService
    return newState;
  }

  /**
   * Применяет эффекты от всех зданий
   */
  private applyAllBuildingEffects(state: GameState): GameState {
    let newState = { ...state };
    
    // Проходим по всем зданиям и применяем их эффекты
    Object.keys(newState.buildings).forEach(buildingId => {
      newState = this.applyBuildingEffects(newState, buildingId);
    });
    
    return newState;
  }

  /**
   * Применяет эффекты от конкретного исследования
   */
  public applyUpgradeEffects(state: GameState, upgradeId: string): GameState {
    console.log(`EffectService: Применение эффектов от исследования ${upgradeId}`);
    
    const upgrade = state.upgrades[upgradeId];
    if (!upgrade || !upgrade.purchased) {
      return state;
    }
    
    let newState = { ...state };
    
    // Добавляем особую обработку для исследования "Основы блокчейна"
    if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
      console.log("EffectService: Обработка исследования 'Основы блокчейна' - добавляем +10% к базовому производству знаний и +50% к максимуму");
      
      if (newState.resources.knowledge) {
        // Инициализируем базовое производство, если оно не установлено
        if (typeof newState.resources.knowledge.baseProduction !== 'number') {
          newState.resources.knowledge.baseProduction = 0;
        }
        
        // Добавляем +10% к базовому производству
        newState.resources.knowledge.baseProduction += 0.1;
        
        // Увеличиваем максимальное количество знаний на 50%
        const currentMax = newState.resources.knowledge.max;
        newState.resources.knowledge.max = currentMax * 1.5;
        
        console.log(`EffectService: Установлено базовое производство знаний: ${newState.resources.knowledge.baseProduction}`);
        console.log(`EffectService: Установлен максимум знаний: ${newState.resources.knowledge.max} (было: ${currentMax})`);
        
        // Уведомляем игрока
        safeDispatchGameEvent("Максимум знаний увеличен на 50%", "success");
      }
    }
    
    return newState;
  }

  /**
   * Применяет эффекты от всех исследований
   */
  private applyAllUpgradeEffects(state: GameState): GameState {
    let newState = { ...state };
    
    // Проходим по всем исследованиям и применяем их эффекты
    Object.keys(newState.upgrades)
      .filter(upgradeId => newState.upgrades[upgradeId].purchased)
      .forEach(upgradeId => {
        newState = this.applyUpgradeEffects(newState, upgradeId);
      });
    
    return newState;
  }

  /**
   * Применяет эффекты от специализации игрока
   */
  private applySpecializationEffects(state: GameState): GameState {
    console.log(`EffectService: Применение эффектов от специализации ${state.specialization}`);
    
    // Эффекты от специализации обрабатываются в BonusCalculationService
    return state;
  }

  /**
   * Сбрасывает все накопленные эффекты
   */
  private resetAllEffects(state: GameState): GameState {
    console.log('EffectService: Сброс всех накопленных эффектов');
    
    // Создаем новое состояние с сброшенными значениями
    let newState = { ...state };
    
    // Сбрасываем baseProduction для ресурсов, оставляя только базовые эффекты
    if (newState.resources.knowledge) {
      // Сохраняем базовый эффект от исследования "Основы блокчейна"
      const hasBlockchainBasics = newState.upgrades.blockchainBasics?.purchased ||
                                 newState.upgrades.basicBlockchain?.purchased ||
                                 newState.upgrades.blockchain_basics?.purchased;
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        baseProduction: hasBlockchainBasics ? 0.1 : 0
      };
    }
    
    // Сбрасываем параметры майнинга
    newState.miningParams = {
      ...newState.miningParams,
      miningEfficiency: 1 // Сбрасываем до базового значения
    };
    
    return newState;
  }
}
