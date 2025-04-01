/**
 * Сервис для расчета бонусов от исследований, зданий и других источников
 */
export class BonusCalculationService {
  
  /**
   * Расчет бонусов для конкретного ресурса
   * @param state Состояние игры
   * @param resourceId ID ресурса
   * @returns Объект с множителями производства и другими бонусами
   */
  calculateResourceBonuses(state: any, resourceId: string): { productionMultiplier: number, maxMultiplier: number } {
    let productionMultiplier = 1;
    let maxMultiplier = 1;
    
    try {
      // Бонусы от исследований
      if (state.upgrades) {
        const upgrades = Object.values(state.upgrades) as any[];
        
        for (const upgrade of upgrades) {
          if (!upgrade.purchased) continue;
          
          // Используем effects или effect, в зависимости от того, что доступно
          const effects = upgrade.effects || upgrade.effect || {};
          
          // Логируем для отладки
          if (resourceId === 'knowledge' && Object.keys(effects).length > 0) {
            console.log(`BonusCalculation: Исследование ${upgrade.name} имеет эффекты:`, effects);
          }
          
          // Применяем увеличение производства ресурса
          if (effects[`${resourceId}ProductionBoost`] !== undefined) {
            const boost = Number(effects[`${resourceId}ProductionBoost`]);
            productionMultiplier += boost;
            
            if (resourceId === 'knowledge') {
              console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к производству ${resourceId}`);
            }
          }
          
          // Применяем увеличение производства общее (например, knowledgeBoost)
          if (resourceId === 'knowledge' && effects.knowledgeBoost !== undefined) {
            const boost = Number(effects.knowledgeBoost);
            productionMultiplier += boost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к производству знаний`);
          }
          
          // Применяем бонусы к максимальному значению
          if (effects[`${resourceId}MaxBoost`] !== undefined) {
            const boost = Number(effects[`${resourceId}MaxBoost`]);
            maxMultiplier += boost;
            
            if (resourceId === 'knowledge') {
              console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к максимуму ${resourceId}`);
            }
          }
          
          // Применяем бонусы к максимуму общие (например, knowledgeMaxBoost)
          if (resourceId === 'knowledge' && effects.knowledgeMaxBoost !== undefined) {
            const boost = Number(effects.knowledgeMaxBoost);
            maxMultiplier += boost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к максимуму знаний`);
          }
        }
      }
      
      // Бонусы от зданий
      if (state.buildings) {
        for (const buildingId in state.buildings) {
          const building = state.buildings[buildingId];
          if (!building.count || building.count <= 0) continue;
          
          // Если здание имеет бонусы к производству
          const productionBoost = building.productionBoost;
          if (typeof productionBoost === 'object' && productionBoost[resourceId]) {
            const totalBoost = Number(productionBoost[resourceId]) * building.count;
            productionMultiplier += totalBoost;
            
            if (resourceId === 'knowledge' && totalBoost > 0) {
              console.log(`BonusCalculation: Здание ${building.name} (${building.count} шт.) добавляет +${totalBoost * 100}% к производству ${resourceId}`);
            }
          }
          
          // Если у здания есть специальные эффекты
          if (buildingId === 'internetConnection' && resourceId === 'knowledge') {
            // Интернет-канал увеличивает скорость получения знаний
            const boost = 0.2 * building.count; // +20% за каждый уровень
            productionMultiplier += boost;
            console.log(`BonusCalculation: Интернет-канал (${building.count} шт.) увеличивает скорость получения знаний на +${boost * 100}%`);
          }
          
          // Криптокошелёк - увеличивает максимум знаний на 25%
          if (buildingId === 'cryptoWallet' && resourceId === 'knowledge') {
            const boost = 0.25 * building.count; // +25% за каждый уровень
            maxMultiplier += boost;
            console.log(`BonusCalculation: Криптокошелёк (${building.count} шт.) увеличивает максимум знаний на +${boost * 100}%`);
          }
        }
      }
      
    } catch (error) {
      console.error(`Ошибка при расчёте бонусов для ресурса ${resourceId}:`, error);
    }
    
    return { productionMultiplier, maxMultiplier };
  }
  
  /**
   * Расчет эффективности майнинга
   * @param state Состояние игры
   * @returns Коэффициент эффективности майнинга
   */
  calculateMiningEfficiency(state: any): number {
    let efficiency = 1;
    
    try {
      // Бонусы от исследований
      if (state.upgrades) {
        // Оптимизация алгоритмов: +15% к эффективности майнинга
        if (state.upgrades.algorithmOptimization?.purchased) {
          efficiency += 0.15;
        }
        
        // Proof of Work: +25% к эффективности майнинга
        if (state.upgrades.proofOfWork?.purchased) {
          efficiency += 0.25;
        }
      }
      
    } catch (error) {
      console.error("Ошибка при расчёте эффективности майнинга:", error);
    }
    
    return efficiency;
  }
  
  /**
   * Расчет энергоэффективности (снижение потребления электричества)
   * @param state Состояние игры
   * @returns Коэффициент энергоэффективности (меньше 1 означает снижение потребления)
   */
  calculateEnergyEfficiency(state: any): number {
    let efficiency = 1;
    
    try {
      // Энергоэффективные компоненты: -10% к потреблению электричества
      if (state.upgrades.energyEfficientComponents?.purchased) {
        efficiency -= 0.1;
      }
      
    } catch (error) {
      console.error("Ошибка при расчёте энергоэффективности:", error);
    }
    
    return Math.max(0.5, efficiency); // Минимальное значение 0.5 (не меньше 50% потребления)
  }

  /**
   * Применяет бонусы от улучшения к состоянию игры
   * @param state Состояние игры
   * @param upgradeId ID улучшения
   * @returns Обновленное состояние игры
   */
  applyUpgradeBonuses(state: any, upgradeId: string): any {
    console.log(`Применение бонусов от улучшения ${upgradeId}`);
    
    // Создаем копию состояния
    let updatedState = { ...state };
    const upgrade = updatedState.upgrades[upgradeId];
    
    if (!upgrade || !upgrade.purchased) {
      return updatedState;
    }
    
    // Обрабатываем специальные эффекты для конкретных улучшений
    if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
      console.log("BonusCalculationService: Применяем специальные эффекты 'Основы блокчейна'");
      
      // 1. Увеличиваем макс. хранение знаний на 50% от базового значения
      if (updatedState.resources.knowledge) {
        const baseMax = 100; // Базовое максимальное значение знаний
        const newMax = baseMax * 1.5; // +50% от базового значения
        
        updatedState.resources.knowledge = {
          ...updatedState.resources.knowledge,
          max: newMax
        };
        
        console.log(`BonusCalculationService: Максимум знаний установлен на ${newMax} (базовый + 50%)`);
      }
      
      // Добавляем эффект для учета 10% бонуса к производству знаний
      if (updatedState.upgrades[upgradeId]) {
        updatedState.upgrades[upgradeId] = {
          ...updatedState.upgrades[upgradeId],
          effects: {
            ...(updatedState.upgrades[upgradeId].effects || {}),
            knowledgeBoost: 0.1,  // +10% к производству знаний
            knowledgeMaxBoost: 0.5 // +50% к максимуму знаний (для отображения эффекта)
          }
        };
      }
      
      // 2. Разблокируем криптокошелек
      if (updatedState.buildings.cryptoWallet) {
        updatedState.buildings.cryptoWallet = {
          ...updatedState.buildings.cryptoWallet,
          unlocked: true
        };
        
        // Добавляем флаг разблокировки в unlocks
        updatedState.unlocks = {
          ...updatedState.unlocks,
          cryptoWallet: true
        };
        
        console.log("BonusCalculationService: Криптокошелек разблокирован");
      }
    }
    
    // Обрабатываем специальные эффекты для "Основы криптовалют"
    if (upgradeId === 'cryptoCurrencyBasics') {
      console.log("BonusCalculationService: Применяем специальные эффекты 'Основы криптовалют'");
      
      // 1. Увеличиваем эффективность применения знаний на 10%
      updatedState.upgrades.cryptoCurrencyBasics = {
        ...updatedState.upgrades.cryptoCurrencyBasics,
        effects: {
          ...(updatedState.upgrades.cryptoCurrencyBasics.effects || {}),
          knowledgeEfficiencyBoost: 0.1 // +10% к эффективности применения знаний
        }
      };
      
      // 2. Разблокируем майнер
      if (updatedState.buildings.miner) {
        updatedState.buildings.miner = {
          ...updatedState.buildings.miner,
          unlocked: true
        };
        
        // Добавляем флаг разблокировки в unlocks
        updatedState.unlocks = {
          ...updatedState.unlocks,
          miner: true
        };
        
        console.log("BonusCalculationService: Майнер разблокирован");
      } else if (updatedState.buildings.autoMiner) {
        // Альтернативное название здания
        updatedState.buildings.autoMiner = {
          ...updatedState.buildings.autoMiner,
          unlocked: true
        };
        
        // Добавляем флаг разблокировки в unlocks
        updatedState.unlocks = {
          ...updatedState.unlocks,
          autoMiner: true
        };
        
        console.log("BonusCalculationService: Автомайнер разблокирован");
      }
    }
    
    return updatedState;
  }

  /**
   * Пересчитывает все бонусы для всех ресурсов
   * @param state Состояние игры
   * @returns Обновленное состояние игры
   */
  recalculateAllBonuses(state: any): any {
    console.log("Пересчет всех бонусов");
    
    // Создаем копию состояния
    let updatedState = { ...state };
    
    // Пересчитываем бонусы для каждого ресурса
    const resourceIds = Object.keys(updatedState.resources);
    for (const resourceId of resourceIds) {
      if (updatedState.resources[resourceId].unlocked) {
        const bonuses = this.calculateResourceBonuses(updatedState, resourceId);
        console.log(`Бонусы для ресурса ${resourceId}:`, bonuses);
      }
    }
    
    // Применяем специальные эффекты для всех купленных улучшений
    const purchasedUpgrades = Object.entries(updatedState.upgrades)
      .filter(([_, upgrade]) => (upgrade as any).purchased)
      .map(([id]) => id);
    
    for (const upgradeId of purchasedUpgrades) {
      updatedState = this.applyUpgradeBonuses(updatedState, upgradeId);
    }
    
    return updatedState;
  }
}
