
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
          const boostKey = `${resourceId}ProductionBoost`;
          if (building.effects[boostKey]) {
            const boost = building.effects[boostKey] * building.count;
            multiplier += boost;
            console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству ${resourceId}`);
          }
          
          // Особые случаи для отдельных зданий
          switch (buildingId) {
            case 'internetConnection':
              if (resourceId === 'knowledge') {
                const boost = 0.2 * building.count; // 20% за каждое интернет-соединение
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к производству знаний`);
              }
              break;
            case 'cryptoLibrary':
              if (resourceId === 'knowledge') {
                const boost = 0.5 * building.count; // 50% за каждую библиотеку
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
      
      // Проверяем наличие бонусов от синергий специализаций
      if (state.specializationSynergies) {
        for (const synergyId in state.specializationSynergies) {
          const synergy = state.specializationSynergies[synergyId];
          
          // Применяем бонусы только от активированных синергий
          if (synergy && synergy.active && synergy.effects) {
            // Проверяем наличие бонуса производства для указанного ресурса
            const boostKey = `${resourceId}ProductionBoost`;
            if (synergy.effects[boostKey]) {
              const boost = synergy.effects[boostKey];
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
      
      // Проверяем наличие бонусов от зданий
      for (const buildingId in state.buildings) {
        const building = state.buildings[buildingId];
        
        // Применяем бонусы только от построенных зданий
        if (building && building.count > 0) {
          // Особые случаи для отдельных зданий
          switch (buildingId) {
            case 'cryptoWallet':
              if (resourceId === 'knowledge') {
                const boost = 0.25 * building.count; // 25% за каждый кошелек
                multiplier += boost;
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +${boost * 100}% к максимуму знаний`);
              } else if (resourceId === 'usdt') {
                // Увеличиваем не процентно, а абсолютным значением, поэтому не трогаем multiplier
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +50 к максимуму USDT`);
              }
              break;
            case 'improvedWallet':
              if (resourceId === 'usdt') {
                // Увеличиваем не процентно, а абсолютным значением, поэтому не трогаем multiplier
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +150 к максимуму USDT`);
              } else if (resourceId === 'bitcoin') {
                // Увеличиваем не процентно, а абсолютным значением, поэтому не трогаем multiplier
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +1 к максимуму BTC`);
              }
              break;
            case 'cryptoLibrary':
              if (resourceId === 'knowledge') {
                // Увеличиваем не процентно, а абсолютным значением
                console.log(`BonusCalculation: ${building.name} (x${building.count}) добавляет +100 к максимуму знаний`);
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
    
    return Math.max(1.0, multiplier); // Не позволяем множителю быть меньше базового
  }
  
  /**
   * Рассчитывает бонус эффективности применения знаний
   */
  calculateKnowledgeEfficiencyMultiplier(state: GameState): number {
    let multiplier = 1.0;
    
    try {
      // Проверяем наличие бонусов от исследований
      for (const upgradeId in state.upgrades) {
        const upgrade = state.upgrades[upgradeId];
        
        // Применяем бонусы только от купленных улучшений
        if (upgrade && upgrade.purchased && upgrade.effects) {
          // Проверяем наличие бонуса эффективности применения знаний
          if (upgrade.effects.knowledgeEfficiencyBoost) {
            const boost = upgrade.effects.knowledgeEfficiencyBoost;
            multiplier += boost;
            console.log(`BonusCalculation: ${upgrade.name} добавляет +${boost * 100}% к эффективности применения знаний`);
          }
        }
      }
      
      // Проверяем особый случай исследования "Основы криптовалют"
      if (state.upgrades.cryptoCurrencyBasics?.purchased) {
        const boost = state.upgrades.cryptoCurrencyBasics.effects?.knowledgeEfficiencyBoost || 0.1;
        // Если уже учли выше, то не добавляем дважды
        if (multiplier === 1.0) {
          multiplier += boost;
          console.log(`BonusCalculation: Основы криптовалют добавляет +${boost * 100}% к эффективности применения знаний`);
        }
      }
    } catch (error) {
      console.warn('Ошибка при расчете множителя эффективности применения знаний:', error);
      // При ошибках возвращаем базовый множитель
      return 1.0;
    }
    
    return Math.max(1.0, multiplier); // Не позволяем множителю быть меньше базового
  }
}
