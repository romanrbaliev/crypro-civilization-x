
import { GameState } from '@/context/types';

/**
 * Сервис для расчета производства и потребления ресурсов
 */
export class ResourceProductionService {
  /**
   * Рассчитывает производство и потребление всех ресурсов
   */
  calculateResourceProduction(state: GameState): any {
    const resources = { ...state.resources };
    
    // Принудительно проверяем разблокировку майнера при наличии исследования "Основы криптовалют"
    this.checkMinerUnlock(state);
    
    // Рассчитываем базовое производство и потребление для каждого ресурса
    for (const resourceId in resources) {
      // Пропускаем неразблокированные ресурсы
      if (!resources[resourceId].unlocked) continue;
      
      let resource = resources[resourceId];
      
      // 1. Проверка специальных случаев для конкретных ресурсов
      switch (resourceId) {
        case 'knowledge':
          // Считаем базовое производство знаний
          let knowledgeProduction = resource.baseProduction || 0;
          
          // Проверяем наличие исследования "Основы блокчейна" для бонуса к производству знаний
          const hasBlockchainBasics = state.upgrades.blockchainBasics?.purchased || 
                                     state.upgrades.basicBlockchain?.purchased || 
                                     state.upgrades.blockchain_basics?.purchased;
          
          // Если есть исследование, увеличиваем производство на 10%
          if (hasBlockchainBasics) {
            const baseProduction = resource.baseProduction || 0;
            knowledgeProduction += baseProduction * 0.1; // Добавляем 10% бонус
            console.log(`ResourceProductionService: скорость производства знаний=${knowledgeProduction.toFixed(2)}/сек (с учетом +10% от Основ блокчейна)`);
          } else {
            console.log(`ResourceProductionService: скорость производства знаний=${knowledgeProduction.toFixed(2)}/сек`);
          }
          
          resources[resourceId] = {
            ...resource,
            production: knowledgeProduction,
            perSecond: knowledgeProduction
          };
          break;
          
        // Другие ресурсы...
        default:
          resources[resourceId] = {
            ...resource,
            production: resource.baseProduction || 0,
            perSecond: resource.baseProduction || 0
          };
      }
    }
    
    return resources;
  }
  
  /**
   * Принудительно проверяет разблокировку майнера при наличии исследования "Основы криптовалют"
   */
  private checkMinerUnlock(state: GameState): void {
    // Проверяем, куплено ли исследование "Основы криптовалют"
    const hasCryptoBasics = 
      (state.upgrades.cryptoCurrencyBasics?.purchased === true) || 
      (state.upgrades.cryptoBasics?.purchased === true);
    
    if (hasCryptoBasics) {
      console.log("ResourceProductionService: Обнаружено исследование 'Основы криптовалют', проверяем разблокировку майнера");
      
      // Проверяем, разблокирован ли майнер
      const isMinerUnlocked = 
        (state.buildings.miner?.unlocked === true) || 
        (state.buildings.autoMiner?.unlocked === true);
      
      if (!isMinerUnlocked) {
        console.warn("ResourceProductionService: Майнер не разблокирован, хотя исследование 'Основы криптовалют' куплено!");
      }
      
      // Проверяем, разблокирован ли Bitcoin
      if (!state.resources.bitcoin?.unlocked) {
        console.warn("ResourceProductionService: Bitcoin не разблокирован, хотя исследование 'Основы криптовалют' куплено!");
      }
    }
  }
}
