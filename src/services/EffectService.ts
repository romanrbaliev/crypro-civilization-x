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
    
    // Обработка специфических эффектов от зданий
    switch (buildingId) {
      case 'cryptoWallet':
        // Увеличиваем максимум USDT и знаний
        if (newState.resources.usdt) {
          const baseUsdtMax = 50; // Базовый максимум для одного кошелька
          const walletCount = building.count;
          const usdtMaxBonus = baseUsdtMax * walletCount;

          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: Math.max(newState.resources.usdt.max || 50, 50 + usdtMaxBonus)
          };
          
          console.log(`EffectService: Максимум USDT увеличен до ${newState.resources.usdt.max}`);
        }
        
        if (newState.resources.knowledge) {
          const knowledgeBasicMax = 100; // Базовый максимум знаний
          const knowledgeMaxBoost = 0.25 * building.count; // +25% за каждый кошелек
          
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: Math.max(
              newState.resources.knowledge.max || knowledgeBasicMax,
              knowledgeBasicMax * (1 + knowledgeMaxBoost)
            )
          };
          
          console.log(`EffectService: Максимум знаний увеличен до ${newState.resources.knowledge.max}`);
        }
        break;
        
      case 'internetChannel':
        // Увел����чиваем скоро��ть получения знаний на 20%
        // и эффективность вычислительной мощности на 5%
        // Эти эффекты будут применены в BonusCalculationService
        break;
        
      case 'cryptoLibrary':
        // Увеличиваем максимум знаний на 100 за каждую библиотеку
        if (newState.resources.knowledge) {
          const knowledgeMaxBonus = 100 * building.count;
          
          newState.resources.knowledge = {
            ...newState.resources.knowledge,
            max: (newState.resources.knowledge.max || 100) + knowledgeMaxBonus
          };
          
          console.log(`EffectService: Максимум знаний увеличен до ${newState.resources.knowledge.max} (библиотека)`);
        }
        break;
        
      case 'enhancedWallet':
        // Увеличиваем максимум USDT на 150 и BTC на 1
        if (newState.resources.usdt) {
          const usdtMaxBonus = 150 * building.count;
          
          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: (newState.resources.usdt.max || 50) + usdtMaxBonus
          };
          
          console.log(`EffectService: Максимум USDT увеличен до ${newState.resources.usdt.max} (улучшенный кошелек)`);
        }
        
        if (newState.resources.bitcoin) {
          const btcMaxBonus = 1 * building.count;
          
          newState.resources.bitcoin = {
            ...newState.resources.bitcoin,
            max: (newState.resources.bitcoin.max || 0.01) + btcMaxBonus
          };
          
          console.log(`EffectService: Максимум BTC увеличен до ${newState.resources.bitcoin.max}`);
        }
        break;
        
      case 'coolingSystem':
        // Снижаем потребление вычислительной мощности на 20%
        // Этот эффект будет применен в BonusCalculationService
        break;
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
    
    // Добавляем особую обработку для исследования "Основы блокчейна"
    if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
      console.log("EffectService: Обработка исследования 'Основы блокчейна'");
      
      if (newState.resources.knowledge) {
        // Увеличиваем максимум знаний на 50%
        const currentMax = newState.resources.knowledge.max || 100;
        const newMax = currentMax * 1.5;
        
        // ИСПРАВЛЕНИЕ: НЕ изменяем напрямую baseProduction, production и perSecond 
        // Это будет сделано в ResourceProductionService для предотвращения двойного применения
        
        newState.resources.knowledge = {
          ...newState.resources.knowledge,
          max: newMax
        };
        
        console.log(`EffectService: Максимум знаний увеличен с ${currentMax} до ${newMax}`);
      } else {
        console.warn("EffectService: Не найден ресурс знания при применении эффектов");
      }
      
      // Проверяем криптокошелек для разблокировки
      if (newState.buildings.cryptoWallet && !newState.buildings.cryptoWallet.unlocked) {
        newState.buildings.cryptoWallet = {
          ...newState.buildings.cryptoWallet,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          cryptoWallet: true
        };
        
        console.log("EffectService: Криптокошелек разблокирован");
      }
    }
    
    // Особая обработка для исследования "Основы криптовалют"
    if (upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
      console.log("EffectService: Особая обработка для исследования 'Основы криптовалют'");
      
      // Добавляем бонус эффективности применения знаний
      if (!newState.upgrades[upgradeId].effects) {
        newState.upgrades[upgradeId].effects = {};
      }
      
      newState.upgrades[upgradeId].effects = {
        ...newState.upgrades[upgradeId].effects,
        knowledgeEfficiencyBoost: 0.1 // +10% к эффективности применения знаний
      };
      
      console.log("EffectService: Установлен бонус +10% к эффективности применения знаний");
      
      // Проверяем и разблокируем майнер по всем возможным ID
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
        
        console.log("EffectService: Майнер (ID: miner) принудительно разблокирован");
      }
      
      // Второй вариант - 'autoMiner'
      if (newState.buildings.autoMiner) {
        newState.buildings.autoMiner = {
          ...newState.buildings.autoMiner,
          unlocked: true
        };
        
        newState.unlocks = {
          ...newState.unlocks,
          autoMiner: true
        };
        
        console.log("EffectService: Автомайнер (ID: autoMiner) принудительно разблокирован");
      }
      
      // Проверяем и разблокируем Bitcoin
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
        
        console.log("EffectService: Ресурс Bitcoin создан");
      } else {
        // Разблокируем существующий ресурс
        newState.resources.bitcoin = {
          ...newState.resources.bitcoin,
          unlocked: true
        };
        
        console.log("EffectService: Существующий ресурс Bitcoin разблокирован");
      }
      
      // Устанавливаем флаг разблокировки Bitcoin
      newState.unlocks = {
        ...newState.unlocks,
        bitcoin: true
      };
    }
    
    // Обработка других исследований
    switch (upgradeId) {
      case 'walletSecurity':
      case 'cryptoWalletSecurity':
        // Увеличиваем максимум USDT на 25%
        if (newState.resources.usdt) {
          const currentMax = newState.resources.usdt.max || 50;
          const newMax = currentMax * 1.25;
          
          newState.resources.usdt = {
            ...newState.resources.usdt,
            max: newMax
          };
          
          console.log(`EffectService: Максимум USDT увеличен с ${currentMax} до ${newMax}`);
        }
        break;
        
      case 'cryptoCurrencyBasics':
      case 'cryptoBasics':
        // Увеличиваем эффективность применения знаний на 10%
        // Этот эффект будет применен в BonusCalculationService
        break;
        
      case 'algorithmOptimization':
        // Увеличиваем эффективность майнинга на 15%
        if (newState.miningParams) {
          newState.miningParams = {
            ...newState.miningParams,
            miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.15
          };
          
          console.log(`EffectService: Эффективность майнинга увеличена до ${newState.miningParams.miningEfficiency}`);
        }
        break;
        
      case 'proofOfWork':
        // Увеличиваем эффективность майнинга на 25%
        if (newState.miningParams) {
          newState.miningParams = {
            ...newState.miningParams,
            miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.25
          };
          
          console.log(`EffectService: Эффективность майнинга увеличена до ${newState.miningParams.miningEfficiency}`);
        }
        break;
        
      case 'energyEfficientComponents':
        // Снижаем потребление электричества на 10%
        if (newState.miningParams) {
          newState.miningParams = {
            ...newState.miningParams,
            energyEfficiency: (newState.miningParams.energyEfficiency || 0) + 0.1
          };
          
          console.log(`EffectService: Энергоэффективность увеличена до ${newState.miningParams.energyEfficiency}`);
        }
        break;
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
    
    let newState = { ...state };
    
    // Применяем эффекты в зависимости от выбранной специализации
    switch (state.specialization) {
      case 'miner':
        // +25% к эффективности май��инга
        if (newState.miningParams) {
          newState.miningParams = {
            ...newState.miningParams,
            miningEfficiency: (newState.miningParams.miningEfficiency || 1) * 1.25
          };
          
          console.log(`EffectService: Эффективность майнинга увеличена до ${newState.miningParams.miningEfficiency} (специализация)`);
        }
        break;
        
      case 'trader':
        // +15% к эффективности обмена BTC на USDT
        // Этот эффект должен применяться при обмене валюты
        break;
        
      case 'analyst':
        // +25% к производству знаний
        // Этот эффект будет применен в BonusCalculationService
        break;
    }
    
    return newState;
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
      // ИСПРАВЛЕНИЕ: Не добавляем базовый эффект здесь, это будет сделано в ResourceProductionService
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        baseProduction: 0
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
