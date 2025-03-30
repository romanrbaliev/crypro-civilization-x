
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
    
    // Специфичные эффекты для разных зданий
    switch (buildingId) {
      case 'practice':
        // Практика увеличивает базовое производство знаний
        if (newState.resources.knowledge) {
          const practiceBonus = 0.21 * building.count;
          console.log(`EffectService: Практика добавляет ${practiceBonus.toFixed(2)} знаний/сек`);
          
          // Проверяем уже имеющийся бонус от практики и добавляем новый
          const currentProduction = newState.resources.knowledge.baseProduction || 0;
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            baseProduction: currentProduction
          };
        }
        break;
      
      case 'cryptoWallet':
        // Криптокошелек увеличивает максимум USDT и знаний
        if (newState.resources.usdt) {
          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: (newState.resources.usdt.max || 50) + (50 * building.count)
          };
        }
        if (newState.resources.knowledge) {
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: (newState.resources.knowledge.max || 100) * (1 + (0.25 * building.count))
          };
        }
        break;
      
      case 'autoMiner':
        // Автомайнер производит Bitcoin
        if (newState.resources.bitcoin) {
          // Базовое производство Bitcoin от автомайнера
          const bitcoinPerSecond = 0.00005 * building.count;
          
          // Применяем бонусы майнинга
          const miningEfficiency = newState.miningParams?.miningEfficiency || 1;
          const finalBitcoinProduction = bitcoinPerSecond * miningEfficiency;
          
          console.log(`EffectService: Автомайнер производит ${finalBitcoinProduction.toFixed(6)} Bitcoin/сек`);
          
          newState.resources.bitcoin = {
            ...newState.resources.bitcoin,
            perSecond: finalBitcoinProduction
          };
        }
        break;
        
      case 'internetConnection':
        // Интернет-канал увеличивает скорость получения знаний
        if (newState.resources.knowledge) {
          const internetBonus = 0.2 * building.count; // +20% за каждый уровень
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            baseProduction: (newState.resources.knowledge.baseProduction || 0) * (1 + internetBonus)
          };
        }
        break;
        
      // Добавьте обработку эффектов для других зданий здесь
    }
    
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
    
    // Проверяем специальные эффекты для конкретных исследований
    switch (upgradeId) {
      case 'blockchainBasics':
      case 'basicBlockchain':
      case 'blockchain_basics':
        console.log("EffectService: Применение эффектов 'Основы блокчейна': +50% к максимуму знаний, +10% к получению знаний");
        
        if (newState.resources.knowledge) {
          // Увеличиваем максимальное количество знаний на 50%
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: newState.resources.knowledge.max * 1.5,
            // Добавляем или увеличиваем базовое производство на 10%
            baseProduction: (newState.resources.knowledge.baseProduction || 0) + 0.1
          };
          
          console.log(`EffectService: Новый максимум знаний: ${newState.resources.knowledge.max}`);
          console.log(`EffectService: Новое базовое производство знаний: ${newState.resources.knowledge.baseProduction}`);
        }
        break;
      
      case 'algorithmOptimization':
        console.log("EffectService: Применение эффектов 'Оптимизация алгоритмов': +15% к эффективности майнинга");
        
        newState = {
          ...newState,
          miningParams: {
            ...newState.miningParams,
            miningEfficiency: (newState.miningParams?.miningEfficiency || 1) * 1.15
          }
        };
        break;
        
      // Другие специальные случаи для исследований
    }
    
    // Применяем общие эффекты из upgrade.effects / upgrade.effect
    const effects = upgrade.effects || upgrade.effect || {};
    
    for (const [effectId, amount] of Object.entries(effects)) {
      newState = this.applyEffect(newState, effectId, amount);
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
    
    // Здесь будет логика применения эффектов от специализации
    // В зависимости от конкретной реализации игры
    
    return state;
  }

  /**
   * Сбрасывает все накопленные эффекты
   */
  private resetAllEffects(state: GameState): GameState {
    console.log('EffectService: Сброс всех накопленных эффектов');
    
    // Создаем новое состояние с сброшенными значениями
    let newState = { ...state };
    
    // Сбрасываем baseProduction для ресурсов
    Object.keys(newState.resources).forEach(resourceId => {
      if (newState.resources[resourceId]) {
        newState.resources[resourceId] = {
          ...newState.resources[resourceId],
          baseProduction: 0
        };
      }
    });
    
    // Сбрасываем параметры майнинга
    newState.miningParams = {
      ...newState.miningParams,
      miningEfficiency: 1 // Сбрасываем до базового значения
    };
    
    return newState;
  }

  /**
   * Применяет конкретный эффект к состоянию
   */
  private applyEffect(state: GameState, effectId: string, amount: any): GameState {
    let newState = { ...state };
    const numAmount = Number(amount);
    
    switch (effectId) {
      case 'knowledgeBoost':
        // Увеличиваем базовый прирост знаний
        if (newState.resources.knowledge) {
          const currentBase = newState.resources.knowledge.baseProduction || 0;
          
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            baseProduction: currentBase + numAmount
          };
          
          console.log(`EffectService: Применен эффект knowledgeBoost (+${numAmount}): увеличение с ${currentBase} до ${newState.resources.knowledge.baseProduction}`);
        }
        break;
      
      case 'knowledgeMaxBoost':
        // Увеличиваем максимум знаний
        if (newState.resources.knowledge) {
          const currentMax = newState.resources.knowledge.max;
          const increase = currentMax * numAmount;
          
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: currentMax + increase
          };
          
          console.log(`EffectService: Применен эффект knowledgeMaxBoost: увеличение с ${currentMax} до ${newState.resources.knowledge.max}`);
        }
        break;
      
      case 'usdtMaxBoost':
        // Увеличиваем максимум USDT
        if (newState.resources.usdt) {
          const currentMax = newState.resources.usdt.max;
          const increase = currentMax * numAmount;
          
          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: currentMax + increase
          };
          
          console.log(`EffectService: Применен эффект usdtMaxBoost: увеличение с ${currentMax} до ${newState.resources.usdt.max}`);
        }
        break;
      
      case 'miningEfficiencyBoost':
        // Увеличиваем эффективность майнинга
        const currentEfficiency = newState.miningParams?.miningEfficiency || 1;
        const newEfficiency = currentEfficiency * (1 + numAmount);
        
        newState = {
          ...newState,
          miningParams: {
            ...newState.miningParams,
            miningEfficiency: newEfficiency
          }
        };
        
        console.log(`EffectService: Применен эффект miningEfficiencyBoost: увеличение с ${currentEfficiency} до ${newEfficiency}`);
        break;
      
      case 'electricityEfficiencyBoost':
        // Увеличиваем эффективность электричества
        if (newState.resources.electricity) {
          const currentEfficiency = newState.resources.electricity.boosts?.efficiency || 1;
          const newEfficiency = currentEfficiency * (1 + numAmount);
          
          newState.resources.electricity = {
            ...newState.resources.electricity,
            boosts: {
              ...(newState.resources.electricity.boosts || {}),
              efficiency: newEfficiency
            }
          };
          
          console.log(`EffectService: Применен эффект electricityEfficiencyBoost: увеличение с ${currentEfficiency} до ${newEfficiency}`);
        }
        break;
      
      default:
        console.log(`EffectService: Неизвестный эффект ${effectId}: ${amount}`);
    }
    
    return newState;
  }
}
