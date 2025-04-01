
import { GameState } from '@/context/types';

/**
 * Сервис для расчета бонусов от зданий, исследований и специализаций
 */
export class BonusCalculationService {
  /**
   * Рассчитывает множитель производства для указанного ресурса
   */
  calculateProductionMultiplier(state: GameState, resourceId: string): number {
    let multiplier = 1.0;
    
    try {
      // Проверяем наличие бонусов от исследований
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        
        // Применяем бонусы только от купленных улучшений
        if (upgrade && upgrade.purchased && upgrade.effects) {
          // Проверяем наличие бонуса производства для указанного ресурса
          const boostKey = `${resourceId}Boost`;
          if (upgrade.effects[boostKey]) {
            const boost = upgrade.effects[boostKey];
            multiplier += boost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к производству ${resourceId}`);
          }
          
          // Проверка общего бонуса производства
          if (upgrade.effects.productionBoost) {
            multiplier += upgrade.effects.productionBoost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${upgrade.effects.productionBoost * 100}% ко всему производству`);
          }
        }
      }
      
      // Проверяем наличие бонусов от зданий
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        
        // Применяем бонусы только от построенных зданий
        if (building && building.count > 0 && building.effects) {
          // Проверяем наличие бонуса производства для указанного ресурса
          const boostKey = `${resourceId}Boost`;
          if (building.effects[boostKey]) {
            const boost = building.effects[boostKey] * building.count;
            multiplier += boost;
            console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству ${resourceId}`);
          }
          
          // Особые случаи для отдельных зданий
          switch (buildingId) {
            case 'internetChannel':
              if (resourceId === 'knowledge' && building.effects?.knowledgeBoost) {
                const boost = building.effects.knowledgeBoost * building.count; // 20% за каждое интернет-соединение
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству знаний`);
              }
              if (resourceId === 'computingPower' && building.effects?.computingPowerBoost) {
                const boost = building.effects.computingPowerBoost * building.count; // 5% за каждое интернет-соединение
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству выч. мощности`);
              }
              break;
            case 'cryptoLibrary':
              if (resourceId === 'knowledge' && building.effects?.knowledgeBoost) {
                const boost = building.effects.knowledgeBoost * building.count; // 50% за каждую библиотеку
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству знаний`);
              }
              break;
          }
        }
      }
      
      // Проверяем улучшение "Основы блокчейна" отдельно для знаний
      if (resourceId === 'knowledge') {
        const blockchainBasics = state.upgrades.blockchainBasics || 
                                state.upgrades.basicBlockchain || 
                                state.upgrades.blockchain_basics;
        
        if (blockchainBasics && blockchainBasics.purchased) {
          console.log("BonusCalculation: Исследование Основы блокчейна имеет эффекты:", blockchainBasics.effects);
          const knowledgeBoost = blockchainBasics.effects?.knowledgeBoost || 0.1; // 10% бонус к производству знаний
          multiplier += knowledgeBoost;
          console.log(`BonusCalculation: Основы блокчейна добавляет +${knowledgeBoost * 100}% к производству знаний`);
        }
      }
      
      // Проверяем "Основы криптовалют" для эффективности применения знаний
      if (resourceId === 'knowledge' && resourceId === 'knowledgeEfficiency') {
        const cryptoCurrencyBasics = state.upgrades.cryptoCurrencyBasics || state.upgrades.cryptoBasics;
        
        if (cryptoCurrencyBasics && cryptoCurrencyBasics.purchased) {
          const knowledgeEffBoost = cryptoCurrencyBasics.effects?.knowledgeEfficiencyBoost || 0.1; // 10% бонус к эффективности знаний
          multiplier += knowledgeEffBoost;
          console.log(`BonusCalculation: Основы криптовалют добавляет +${knowledgeEffBoost * 100}% к эффективности применения знаний`);
        }
      }
      
      // Проверяем наличие бонусов от специализаций
      if (state.specialization) {
        switch (state.specialization) {
          case 'analyst':
            if (resourceId === 'knowledge') {
              multiplier += 0.25; // +25% к производству знаний
              console.log(`BonusCalculation: Специализация Аналитик даёт +25% к производству знаний`);
            }
            break;
          case 'miner':
            if (resourceId === 'bitcoin') {
              multiplier += 0.25; // +25% к эффективности майнинга
              console.log(`BonusCalculation: Специализация Майнер даёт +25% к эффективности майнинга`);
            }
            break;
          case 'influencer':
            if (resourceId === 'knowledge') {
              multiplier += 0.1; // +10% к производству знаний
              console.log(`BonusCalculation: Специализация Инфлюенсер даёт +10% к производству знаний`);
            }
            break;
        }
      }
      
      // Проверяем наличие бонусов от синергий специализаций
      if (state.specializationSynergies) {
        for (const synergyId in state.specializationSynergies) {
          const synergy = state.specializationSynergies[synergyId];
          
          // Применяем бонусы только от активированных синергий
          if (synergy && synergy.active && synergy.bonus) { // Используем bonus вместо effects
            // Проверяем наличие бонуса производства для указанного ресурса
            const boostKey = `${resourceId}ProductionBoost`;
            if (synergy.bonus[boostKey]) {
              const boost = synergy.bonus[boostKey];
              multiplier += boost;
              console.log(`BonusCalculation: Синергия ${synergy.name} добавляет +${boost * 100}% к производству ${resourceId}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Ошибка при расчете множителя производства:', error);
      // При ошибках возвращаем базовый множитель
      return 1.0;
    }
    
    return Math.max(0, multiplier); // Не позволяем множителю быть отрицательным
  }
  
  /**
   * Рассчитывает множитель максимального значения для указанного ресурса
   */
  calculateMaxValueMultiplier(state: GameState, resourceId: string): number {
    let multiplier = 1.0;
    
    try {
      // Проверяем наличие бонусов от исследований
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        
        // Применяем бонусы только от купленных улучшений
        if (upgrade && upgrade.purchased && upgrade.effects) {
          // Проверяем наличие бонуса максимального значения для указанного ресурса
          const maxBoostKey = `${resourceId}MaxBoost`;
          if (upgrade.effects[maxBoostKey]) {
            const boost = upgrade.effects[maxBoostKey];
            multiplier += boost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к максимуму ${resourceId}`);
          }
        }
      }
      
      // Особые случаи для знаний - улучшение "Основы блокчейна"
      if (resourceId === 'knowledge') {
        // Проверяем все возможные ID для исследования
        const blockchainBasics = state.upgrades.blockchainBasics || 
                                state.upgrades.basicBlockchain || 
                                state.upgrades.blockchain_basics;
                                
        if (blockchainBasics && blockchainBasics.purchased) {
          // Этот эффект может быть записан в разных местах, поэтому проверяем все варианты
          const knowledgeMaxBoost = blockchainBasics.effects?.knowledgeMaxBoost || 0.5; // 50% бонус к макс. знаниям
          multiplier += knowledgeMaxBoost;
          console.log(`BonusCalculation: Основы блокчейна добавляет +${knowledgeMaxBoost * 100}% к максимуму знаний`);
        }
      }
      
      // Особые случаи для USDT - улучшение "Безопасность криптокошельков"
      if (resourceId === 'usdt') {
        const walletSecurity = state.upgrades.walletSecurity || state.upgrades.cryptoWalletSecurity;
                                
        if (walletSecurity && walletSecurity.purchased) {
          const usdtMaxBoost = walletSecurity.effects?.usdtMaxBoost || 0.25; // 25% бонус к макс. USDT
          multiplier += usdtMaxBoost;
          console.log(`BonusCalculation: Безопасность криптокошельков добавляет +${usdtMaxBoost * 100}% к максимуму USDT`);
        }
      }
      
      // Проверяем наличие бонусов от зданий
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        
        if (building && building.count > 0) {
          // Специальные случаи для зданий
          switch (buildingId) {
            case 'cryptoWallet':
              if (resourceId === 'knowledge') {
                // +25% к максимуму знаний за каждый кошелек
                const boost = 0.25 * building.count;
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к максимуму знаний`);
              }
              break;
              
            case 'cryptoLibrary':
              if (resourceId === 'knowledge') {
                // +100 фиксированная величина к максимуму знаний за каждую библиотеку
                // Этот эффект учитывается отдельно при покупке здания
                console.log(`BonusCalculation: ${building.name} (x${building.count}) учитываются отдельные фиксированные бонусы к максимуму знаний`);
              }
              break;
          }
        }
      }
    } catch (error) {
      console.warn('Ошибка при расчете множителя максимального значения:', error);
      // При ошибках возвращаем базовый множитель
      return 1.0;
    }
    
    return Math.max(0, multiplier); // Не позволяем множителю быть отрицательным
  }
  
  /**
   * Рассчитывает снижение потребления ресурсов
   */
  calculateConsumptionReduction(state: GameState, resourceId: string): number {
    let reduction = 0;
    
    try {
      // Проверяем наличие бонусов от исследований
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        
        // Применяем бонусы только от купленных улучшений
        if (upgrade && upgrade.purchased && upgrade.effects) {
          // Проверяем наличие бонуса снижения потребления для указанного ресурса
          const reductionKey = `${resourceId}ConsumptionReduction`;
          if (upgrade.effects[reductionKey]) {
            const reductionValue = upgrade.effects[reductionKey];
            reduction += reductionValue;
            console.log(`BonusCalculation: ${upgrade.name} снижает потребление ${resourceId} на ${reductionValue * 100}%`);
          }
        }
      }
      
      // Специальный случай для электричества - "Энергоэффективные компоненты"
      if (resourceId === 'electricity' && state.miningParams) {
        const energyEfficiency = state.miningParams.energyEfficiency || 0;
        reduction += energyEfficiency;
        console.log(`BonusCalculation: Энергоэффективность снижает потребление электричества на ${energyEfficiency * 100}%`);
      }
      
      // Проверяем наличие бонусов от зданий
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        
        // Применяем бонусы только от построенных зданий
        if (building && building.count > 0 && building.effects) {
          // Проверяем наличие бонуса снижения потребления для указанного ресурса
          const reductionKey = `${resourceId}ConsumptionReduction`;
          if (building.effects[reductionKey]) {
            const reductionValue = building.effects[reductionKey] * building.count;
            reduction += reductionValue;
            console.log(`BonusCalculation: ${building.name} (x${building.count}) снижает потребление ${resourceId} на ${reductionValue * 100}%`);
          }
        }
      }
      
      // Специальный случай для вычислительной мощности - "Система охлаждения"
      if (resourceId === 'computingPower') {
        const coolingSystem = state.buildings.coolingSystem;
        if (coolingSystem && coolingSystem.count > 0 && coolingSystem.effects?.computingPowerConsumptionReduction) {
          const coolingReduction = coolingSystem.effects.computingPowerConsumptionReduction * coolingSystem.count;
          reduction += coolingReduction;
          console.log(`BonusCalculation: Система охлаждения (x${coolingSystem.count}) снижает потребление вычислительной мощности на ${coolingReduction * 100}%`);
        }
      }
    } catch (error) {
      console.warn('Ошибка при расчете снижения потребления:', error);
    }
    
    // Ограничиваем снижение потребления до 90%
    return Math.min(0.9, reduction);
  }
  
  /**
   * Рассчитывает бонус обмена BTC
   */
  calculateBtcExchangeBonus(state: GameState): number {
    let bonus = 0;
    
    try {
      // Проверяем специализацию "Трейдер"
      if (state.specialization === 'trader') {
        bonus += 0.15; // +15% к эффективности обмена
        console.log(`BonusCalculation: Специализация Трейдер даёт +15% к эффективности обмена BTC`);
      }
      
      // Проверяем улучшенный кошелек
      const enhancedWallet = state.buildings.enhancedWallet;
      if (enhancedWallet && enhancedWallet.count > 0 && enhancedWallet.effects?.btcExchangeBonus) {
        const walletBonus = enhancedWallet.effects.btcExchangeBonus * enhancedWallet.count;
        bonus += walletBonus;
        console.log(`BonusCalculation: Улучшенный кошелек (x${enhancedWallet.count}) даёт +${walletBonus * 100}% к эффективности обмена BTC`);
      }
    } catch (error) {
      console.warn('Ошибка при расчете бонуса обмена BTC:', error);
    }
    
    return bonus;
  }
}
