import { GameState, Resource, Building, Upgrade } from '@/context/types';
import { safeDispatchGameEvent } from '../context/utils/eventBusUtils';

/**
 * Централизованный сервис для расчета производства ресурсов
 */
export class ResourceProductionService {
  /**
   * Расчет производства ресурсов на основе текущего состояния игры
   */
  static calculateResourceProduction(state: GameState): { [key: string]: Resource } {
    // Создаем копию ресурсов, чтобы не изменять оригинал
    const newResources = JSON.parse(JSON.stringify(state.resources));
    
    // Сбрасываем текущие значения производства
    this.resetProductionValues(newResources);
    
    // Применяем базовое производство от зданий
    this.applyBuildingProduction(newResources, state.buildings);
    
    // Применяем бонусы от улучшений
    this.applyUpgradeBoosts(newResources, state.upgrades);
    
    // Применяем бонусы от рефералов
    this.applyReferralBoosts(newResources, state);
    
    // Применяем бонусы от помощников
    this.applyHelperBoosts(newResources, state);
    
    // Применяем бонусы от специализации
    this.applySpecializationBoosts(newResources, state);
    
    // Применяем бонусы от интернет-канала и других инфраструктурных зданий
    this.applyInfrastructureBoosts(newResources, state.buildings);
    
    // Применяем потребление ресурсов
    this.applyResourceConsumption(newResources, state.buildings);

    // Обрабатываем майнинг Bitcoin
    this.processBitcoinMining(newResources, state);
    
    // Логируем результаты расчета для отладки
    this.logProductionResults(newResources);
    
    return newResources;
  }
  
  /**
   * Сброс текущих значений производства ресурсов
   */
  private static resetProductionValues(resources: { [key: string]: Resource }): void {
    Object.keys(resources).forEach(resourceId => {
      resources[resourceId].production = 0;
      resources[resourceId].perSecond = 0;
      
      // Инициализируем объект с бустами, если его нет
      if (!resources[resourceId].boosts) {
        resources[resourceId].boosts = {};
      } else {
        // Очищаем существующие бусты
        resources[resourceId].boosts = {};
      }
    });
  }
  
  /**
   * Применение базового производства от зданий
   */
  private static applyBuildingProduction(
    resources: { [key: string]: Resource },
    buildings: { [key: string]: Building }
  ): void {
    Object.values(buildings).forEach(building => {
      if (building.count <= 0 || !building.unlocked) return;
      
      const { production = {}, id: buildingId } = building;
      
      // Для каждого ресурса, который производит здание
      Object.entries(production).forEach(([productionType, amount]) => {
        // Пропускаем эффекты на максимум и бусты
        if (productionType.includes('Max') || productionType.includes('Boost')) return;
        
        // Получаем ресурс для обновления
        const resourceId = productionType;
        const resource = resources[resourceId];
        
        if (resource && resource.unlocked) {
          // Рассчитываем базовое производство с учетом множителя здания
          const productionAmount = Number(amount) * building.count * (1 + (building.productionBoost || 0));
          
          // Обновляем значения производства
          resource.production += productionAmount;
          resource.perSecond += productionAmount;
          
          // Добавляем информацию о производстве в объект здания
          if (!building.resourceProduction) {
            building.resourceProduction = {};
          }
          
          building.resourceProduction[resourceId] = productionAmount;
          
          console.log(`Здание ${building.name} (${building.count} шт.) производит ${productionAmount.toFixed(3)} ${resource.name}/сек`);
        }
      });
    });
  }
  
  /**
   * Применение бонусов от улучшений
   */
  private static applyUpgradeBoosts(
    resources: { [key: string]: Resource },
    upgrades: { [key: string]: Upgrade }
  ): void {
    Object.values(upgrades).forEach(upgrade => {
      if (!upgrade.purchased) return;
      
      const effects = upgrade.effects || {};
      
      // Обрабатываем каждый эффект улучшения
      Object.entries(effects).forEach(([effectType, value]) => {
        // Прямое увеличение производства ресурса (например, knowledgeBoost)
        if (effectType.endsWith('Boost') && !effectType.includes('Max')) {
          const resourceId = effectType.replace('Boost', '');
          const resource = resources[resourceId];
          
          if (resource && resource.unlocked) {
            const boostValue = Number(value);
            const productionBoost = resource.production * boostValue;
            
            // Добавляем буст от улучшения
            if (!resource.boosts) resource.boosts = {};
            if (!resource.boosts[upgrade.id]) resource.boosts[upgrade.id] = 0;
            
            resource.boosts[upgrade.id] = productionBoost;
            resource.perSecond += productionBoost;
            
            console.log(`Улучшение ${upgrade.name} увеличивает производство ${resource.name} на ${(boostValue * 100).toFixed(0)}% (+${productionBoost.toFixed(3)}/сек)`);
          }
        }
        
        // Проверяем на прямые типы ресурсов с ProductionBoost
        if (effectType.endsWith('ProductionBoost')) {
          const resourceId = effectType.replace('ProductionBoost', '');
          const resource = resources[resourceId];
          
          if (resource && resource.unlocked) {
            const boostValue = Number(value);
            const productionBoost = resource.production * boostValue;
            
            // Добавляем буст от улучшения
            if (!resource.boosts) resource.boosts = {};
            if (!resource.boosts[upgrade.id]) resource.boosts[upgrade.id] = 0;
            
            resource.boosts[upgrade.id] = productionBoost;
            resource.perSecond += productionBoost;
            
            console.log(`Улучшение ${upgrade.name} увеличивает производство ${resource.name} на ${(boostValue * 100).toFixed(0)}% (+${productionBoost.toFixed(3)}/сек)`);
          }
        }
      });
    });
  }
  
  /**
   * Применение бонусов от рефералов
   */
  private static applyReferralBoosts(
    resources: { [key: string]: Resource },
    state: GameState
  ): void {
    // Подсчет активных рефералов
    const activeReferrals = state.referrals.filter(ref => {
      if (typeof ref.activated === 'boolean') {
        return ref.activated === true;
      } else if (typeof ref.activated === 'string') {
        return ref.activated.toLowerCase() === 'true';
      }
      return false;
    });
    
    // Базовый бонус: +5% за каждого акт��вного рефера��а
    const referralBonus = activeReferrals.length * 0.05;
    
    if (referralBonus > 0) {
      // Применяем бонус ко всем ресурсам
      Object.keys(resources).forEach(resourceId => {
        const resource = resources[resourceId];
        
        if (resource.unlocked && resource.production > 0) {
          const bonusAmount = resource.production * referralBonus;
          
          // Добавляем буст от рефералов
          if (!resource.boosts) resource.boosts = {};
          if (!resource.boosts['referrals']) resource.boosts['referrals'] = 0;
          
          resource.boosts['referrals'] = bonusAmount;
          resource.perSecond += bonusAmount;
          
          console.log(`Бонус от ${activeReferrals.length} рефералов: +${(referralBonus * 100).toFixed(0)}% к производству ${resource.name} (+${bonusAmount.toFixed(3)}/сек)`);
        }
      });
    }
  }
  
  /**
   * Применение бонусов от помощников
   */
  private static applyHelperBoosts(
    resources: { [key: string]: Resource },
    state: GameState
  ): void {
    const { buildings, referralHelpers, referralCode } = state;
    
    // Бонусы от помощников для реферрера (владельца зданий)
    if (referralHelpers.length > 0 && referralCode) {
      // Группируем помощников по зданиям
      const buildingHelperMap: { [buildingId: string]: number } = {};
      
      referralHelpers.forEach(helper => {
        if (helper.status === 'accepted' && helper.employerId === referralCode) {
          buildingHelperMap[helper.buildingId] = (buildingHelperMap[helper.buildingId] || 0) + 1;
        }
      });
      
      // Применяем бонусы для каждого здания с помощниками
      Object.entries(buildingHelperMap).forEach(([buildingId, helperCount]) => {
        const building = buildings[buildingId];
        
        if (building && building.count > 0 && building.resourceProduction) {
          // Расчет бонуса от помощников: +10% за каждого помощника
          const helperBonus = helperCount * 0.1;
          
          // Для каждого ресурса, производимого зданием
          Object.entries(building.resourceProduction).forEach(([resourceId, baseProduction]) => {
            const resource = resources[resourceId];
            
            if (resource && resource.unlocked) {
              const bonusAmount = Number(baseProduction) * helperBonus;
              
              // Добавляем буст от помощников
              if (!resource.boosts) resource.boosts = {};
              if (!resource.boosts[`helpers_${buildingId}`]) resource.boosts[`helpers_${buildingId}`] = 0;
              
              resource.boosts[`helpers_${buildingId}`] = bonusAmount;
              resource.perSecond += bonusAmount;
              
              console.log(`Бонус от ${helperCount} помощников для здания ${building.name}: +${(helperBonus * 100).toFixed(0)}% к производству ${resource.name} (+${bonusAmount.toFixed(3)}/сек)`);
            }
          });
        }
      });
    }
    
    // Бонус для самого игрока, если он является помощником в других зданиях
    try {
      const currentUserId = window.__game_user_id || localStorage.getItem('crypto_civ_user_id');
      if (currentUserId) {
        // Проверяем, где текущий пользователь выступает в роли помощника
        const whereIAmHelper = referralHelpers.filter(h => 
          h.helperId === currentUserId && h.status === 'accepted'
        );
        
        const helperBuildingsCount = whereIAmHelper.length;
        
        if (helperBuildingsCount > 0) {
          // Базовое производство знаний получает бонус от статуса помощника
          const helperBonus = helperBuildingsCount * 0.1; // 10% за каждое здание
          
          // Проходим по всем ресурсам
          Object.keys(resources).forEach(resourceId => {
            const resource = resources[resourceId];
            
            if (resource.unlocked && resource.production > 0) {
              const bonusAmount = resource.production * helperBonus;
              
              // Добавляем буст от статуса помощника
              if (!resource.boosts) resource.boosts = {};
              if (!resource.boosts['helper_status']) resource.boosts['helper_status'] = 0;
              
              resource.boosts['helper_status'] = bonusAmount;
              resource.perSecond += bonusAmount;
              
              console.log(`Статус помощника (${helperBuildingsCount} зданий) даёт бонус +${(helperBonus * 100).toFixed(0)}% к производству ${resource.name} (+${bonusAmount.toFixed(3)}/сек)`);
            }
          });
        }
      }
    } catch (error) {
      console.error("Ошибка при расчете бонусов помощника:", error);
    }
  }
  
  /**
   * Применение бонусов от специализации
   */
  private static applySpecializationBoosts(
    resources: { [key: string]: Resource },
    state: GameState
  ): void {
    // Получаем активные синергии специализации
    const activeSynergies = Object.values(state.specializationSynergies || {}).filter(
      synergy => synergy.active
    );
    
    // Применяем бонусы от каждой активной синергии
    activeSynergies.forEach(synergy => {
      const { bonus = {}, name } = synergy;
      
      // Обрабатываем каждый бонус синергии
      Object.entries(bonus).forEach(([bonusType, value]) => {
        // Бонус к производству ресурса
        if (bonusType.endsWith('ProductionBoost')) {
          const resourceId = bonusType.replace('ProductionBoost', '');
          const resource = resources[resourceId];
          
          if (resource && resource.unlocked) {
            const boostValue = Number(value);
            const productionBoost = resource.production * boostValue;
            
            // Добавляем буст от синергии
            if (!resource.boosts) resource.boosts = {};
            if (!resource.boosts[`synergy_${synergy.id}`]) resource.boosts[`synergy_${synergy.id}`] = 0;
            
            resource.boosts[`synergy_${synergy.id}`] = productionBoost;
            resource.perSecond += productionBoost;
            
            console.log(`Синергия "${name}" увеличивает производство ${resource.name} на ${(boostValue * 100).toFixed(0)}% (+${productionBoost.toFixed(3)}/сек)`);
          }
        }
      });
    });
  }
  
  /**
   * Применение бонусов от интернет-канала и других инфраструктурных зданий
   */
  private static applyInfrastructureBoosts(
    resources: { [key: string]: Resource },
    buildings: { [key: string]: Building }
  ): void {
    // Проверяем наличие интернет-канала
    const internetConnection = buildings.internetConnection;
    if (internetConnection && internetConnection.count > 0 && internetConnection.unlocked) {
      // Применяем 20% бонус к производству знаний
      const knowledgeResource = resources.knowledge;
      if (knowledgeResource && knowledgeResource.unlocked) {
        // Добавляем буст от интернет-канала
        const boostValue = 0.2; // 20% бонус
        const productionBoost = knowledgeResource.production * boostValue;
        
        if (!knowledgeResource.boosts) knowledgeResource.boosts = {};
        knowledgeResource.boosts['internetConnection'] = productionBoost;
        knowledgeResource.perSecond += productionBoost;
        
        console.log(`Интернет-канал (${internetConnection.count} шт.) увеличивает производство знаний на ${(boostValue * 100).toFixed(0)}% (+${productionBoost.toFixed(3)}/сек)`);
      }
      
      // Применяем 5% бонус к эффективности вычислительной мощности
      const computingPowerResource = resources.computingPower;
      if (computingPowerResource && computingPowerResource.unlocked) {
        // Добавляем буст к вычислительной мощности
        const boostValue = 0.05; // 5% бонус
        const productionBoost = computingPowerResource.production * boostValue;
        
        if (!computingPowerResource.boosts) computingPowerResource.boosts = {};
        computingPowerResource.boosts['internetConnection'] = productionBoost;
        computingPowerResource.perSecond += productionBoost;
        
        console.log(`Интернет-канал (${internetConnection.count} шт.) увеличивает эффективность вычислит. мощности на ${(boostValue * 100).toFixed(0)}% (+${productionBoost.toFixed(3)}/сек)`);
      }
    }
  }
  
  /**
   * Обработка майнинга Bitcoin
   */
  private static processBitcoinMining(
    resources: { [key: string]: Resource },
    state: GameState
  ): void {
    const { autoMiner } = state.buildings;
    const { electricity, computingPower, btc } = resources;
    
    // Если нет необходимых ресурсов или майнеров, майнинг не происходит
    if (!autoMiner || autoMiner.count <= 0 || !electricity || !computingPower || !btc || !btc.unlocked) {
      // Явно устанавливаем нулевую скорость майнинга, если условия не выполняются
      if (btc && btc.unlocked) {
        btc.perSecond = 0;
      }
      return;
    }
    
    // Количество автомайнеров
    const minerCount = autoMiner.count;
    
    // Потребление ресурсов майнерами
    const electricityConsumption = (autoMiner.consumption?.electricity || 2) * minerCount;
    const computingPowerConsumption = (autoMiner.consumption?.computingPower || 10) * minerCount;
    
    // Базовая скорость производства BTC: 0.00005 BTC за секунду на один майнер
    const baseBtcPerSecond = 0.00005;
    
    // Получаем бонус к майнингу от исследований
    let miningEfficiencyBonus = 1.0; // Начальный множитель без бонусов
    
    // Проверяем исследования, влияющие на эффективность майнинга
    if (state.upgrades.algorithmOptimization && state.upgrades.algorithmOptimization.purchased) {
      // +15% к эффективности майнинга от "Оптимизация алгоритмов"
      miningEfficiencyBonus += 0.15;
      console.log("Применен бонус от исследования 'Оптимизация алгоритмов': +15% к майнингу");
    }
    
    if (state.upgrades.cryptoCurrencyBasics && state.upgrades.cryptoCurrencyBasics.purchased) {
      // +10% к эффективности майнинга от "Основы криптовалют"
      miningEfficiencyBonus += 0.10;
      console.log("Применен бонус от исследования 'Основы криптовалют': +10% к майнингу");
    }
    
    // Финальная скорость добычи BTC с учетом количества майнеров и бонусов
    const btcPerSecond = baseBtcPerSecond * minerCount * miningEfficiencyBonus;
    
    // Устанавливаем скорость добычи
    btc.perSecond = btcPerSecond;
    
    console.log(`Майнинг: скорость добычи составляет ${btcPerSecond.toFixed(8)} BTC/сек (${minerCount} майнеров, множитель эффективности: ${miningEfficiencyBonus.toFixed(2)})`);
  }
  
  /**
   * Применение потребления ресурсов
   */
  private static applyResourceConsumption(
    resources: { [key: string]: Resource },
    buildings: { [key: string]: Building }
  ): void {
    Object.values(buildings).forEach(building => {
      if (building.count <= 0 || !building.consumption || !building.unlocked) return;
      
      // Обрабатываем каждый тип потребляемого ресурса
      Object.entries(building.consumption).forEach(([resourceId, amount]) => {
        const resource = resources[resourceId];
        
        if (resource && resource.unlocked) {
          // Рассчитываем общее потребление
          const consumptionAmount = Number(amount) * building.count;
          
          // Вычитаем потребление из perSecond
          resource.perSecond -= consumptionAmount;
          
          console.log(`Здание ${building.name} (${building.count} шт.) потребляет ${consumptionAmount.toFixed(3)} ${resource.name}/сек`);
        }
      });
    });
  }
  
  /**
   * Логирование результатов расчета для отладки
   */
  private static logProductionResults(resources: { [key: string]: Resource }): void {
    console.log('=== Итоговое производство ресурсов ===');
    
    Object.values(resources)
      .filter(resource => resource.unlocked)
      .forEach(resource => {
        const boostedProduction = resource.perSecond;
        const baseProduction = resource.production;
        
        // Выводим только для ресурсов с производством или потреблением
        if (boostedProduction !== 0 || baseProduction !== 0) {
          if (boostedProduction > baseProduction) {
            console.log(`${resource.name}: ${baseProduction.toFixed(3)}/сек (база) → ${boostedProduction.toFixed(3)}/сек (с бонусами) [+${(boostedProduction - baseProduction).toFixed(3)}]`);
          } else if (boostedProduction < baseProduction) {
            console.log(`${resource.name}: ${baseProduction.toFixed(3)}/сек (база) → ${boostedProduction.toFixed(3)}/сек (с потреблением) [${(boostedProduction - baseProduction).toFixed(3)}]`);
          } else {
            console.log(`${resource.name}: ${baseProduction.toFixed(3)}/сек (без бонусов и потребления)`);
          }
        }
      });
  }
}
