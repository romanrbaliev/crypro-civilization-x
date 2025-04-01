
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
          
          // Применяем бонусы к максимальному значению
          if (effects[`${resourceId}MaxBoost`] !== undefined) {
            const boost = Number(effects[`${resourceId}MaxBoost`]);
            maxMultiplier += boost;
            
            if (resourceId === 'knowledge') {
              console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к максимуму ${resourceId}`);
            }
          }
          
          // Обрабатываем специальные эффекты для конкретных исследований
          if (upgrade.id === 'blockchainBasics' || upgrade.id === 'basicBlockchain' || upgrade.id === 'blockchain_basics') {
            if (resourceId === 'knowledge') {
              // Увеличиваем производство знаний на 10%
              productionMultiplier += 0.1;
              // Увеличиваем максимум знаний на 50%
              maxMultiplier += 0.5;
              console.log(`BonusCalculation: Основы блокчейна увеличивают производство знаний на +10%, максимум на +50%`);
            }
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
    
    // В будущем здесь может быть более сложная логика
    // для применения различных бонусов от разных улучшений
    
    return state;
  }

  /**
   * Пересчитывает все бонусы для всех ресурсов
   * @param state Состояние игры
   * @returns Обновленное состояние игры
   */
  recalculateAllBonuses(state: any): any {
    console.log("Пересчет всех бонусов");
    
    // Создаем копию состояния
    const updatedState = { ...state };
    
    // Пересчитываем бонусы для каждого ресурса
    const resourceIds = Object.keys(updatedState.resources);
    for (const resourceId of resourceIds) {
      if (updatedState.resources[resourceId].unlocked) {
        const bonuses = this.calculateResourceBonuses(updatedState, resourceId);
        console.log(`Бонусы для ресурса ${resourceId}:`, bonuses);
      }
    }
    
    return updatedState;
  }
}
