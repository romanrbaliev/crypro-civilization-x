import { GameState } from '../types';

// Обработка обновления ресурсов
export const processResourceUpdate = (state: GameState): GameState => {
  // Текущее время
  const now = Date.now();
  const deltaTime = (now - state.lastUpdate) / 1000; // разница в секундах
  
  // Если прошло недостаточно времени, возвращаем текущее состояние
  if (deltaTime < 0.05) {
    return state;
  }
  
  // Создаем новое состояние
  const newResources = { ...state.resources };
  const gameTime = state.gameTime + deltaTime;
  
  // Обновляем базовое производство ресурсов
  for (const [resourceId, resource] of Object.entries(newResources)) {
    // Сбрасываем производство
    newResources[resourceId] = {
      ...resource,
      production: 0,
      perSecond: 0
    };
  }
  
  // Обновляем производство на основе зданий
  let totalComputingPower = 0;
  let totalElectricityConsumption = 0;
  let electricityGain = 0;
  
  // Сначала рассчитываем производство электричества
  for (const building of Object.values(state.buildings)) {
    // Пропускаем неактивные здания
    if (building.count <= 0) continue;
    
    // Если здание производит электричество, учитываем его
    if (building.production.electricity) {
      electricityGain += building.production.electricity * building.count;
    }
  }
  
  // Затем рассчитываем потребление электричества и производство вычислительной мощности
  for (const building of Object.values(state.buildings)) {
    // Пропускаем неактивные здания
    if (building.count <= 0) continue;
    
    // Если здание - компьютер, оно потребляет электричество
    if (building.id === "homeComputer") {
      // Базовое потребление: 0.5 электричества на единицу
      const computerConsumption = 0.5 * building.count;
      totalElectricityConsumption += computerConsumption;
      
      // Если есть достаточно электричества, то генерируем вычислительную мощность
      if (newResources.electricity.value >= computerConsumption * deltaTime || electricityGain >= computerConsumption) {
        // Рассчитываем производство вычислительной мощности
        // Базовое производство с учетом бонусов от улучшений
        let computingPowerBoost = 1.0;
        
        // Проверяем улучшения для вычислительной мощности
        for (const upgrade of Object.values(state.upgrades)) {
          if (upgrade.purchased && upgrade.effects && upgrade.effects.computingPowerBoost) {
            computingPowerBoost += Number(upgrade.effects.computingPowerBoost);
          }
        }
        
        // Проверяем здания, дающие бонус к вычислительной мощности (например, система охлаждения)
        for (const otherBuilding of Object.values(state.buildings)) {
          if (otherBuilding.count > 0 && otherBuilding.production.computingPowerBoost) {
            computingPowerBoost += Number(otherBuilding.production.computingPowerBoost);
          }
        }
        
        // Рассчитываем итоговое производство вычислительной мощности
        const computingPowerProduction = building.production.computingPower * building.count * computingPowerBoost;
        totalComputingPower += computingPowerProduction;
        
        // Обновляем производство вычислительной мощности
        newResources.computingPower.production += computingPowerProduction;
        newResources.computingPower.perSecond += computingPowerProduction;
      }
    }
    
    // Обработка других типов зданий и их производства
    for (const [prodResourceId, prodAmount] of Object.entries(building.production)) {
      // Пропускаем особые ключи
      if (prodResourceId === "computingPower" || prodResourceId === "electricity") continue;
      if (prodResourceId.endsWith("Boost") || prodResourceId.endsWith("Max")) continue;
      
      // Для стандартных ресурсов
      if (newResources[prodResourceId]) {
        // Базовое производство
        let baseProduction = Number(prodAmount) * building.count;
        
        // Учитываем бонусы производства от улучшений
        const boostKey = `${prodResourceId}Boost`;
        let productionBoost = 0;
        
        // Проверяем улучшения для данного ресурса
        for (const upgrade of Object.values(state.upgrades)) {
          if (upgrade.purchased && upgrade.effects && upgrade.effects[boostKey]) {
            productionBoost += Number(upgrade.effects[boostKey]);
          }
        }
        
        // Проверяем здания, дающие бонус к производству
        for (const otherBuilding of Object.values(state.buildings)) {
          if (otherBuilding.count > 0 && otherBuilding.production[boostKey]) {
            productionBoost += Number(otherBuilding.production[boostKey]);
          }
        }
        
        // Рассчитываем итоговое производство
        const finalProduction = baseProduction * (1 + productionBoost);
        
        // Обновляем производство ресурса
        newResources[prodResourceId].production += finalProduction;
        newResources[prodResourceId].perSecond += finalProduction;
      }
    }
  }
  
  // Обновляем текущую электричество с учетом потребления
  const netElectricityProduction = electricityGain - totalElectricityConsumption;
  newResources.electricity.perSecond = netElectricityProduction;
  
  // Обработка автоматического майнинга биткоинов
  if (state.buildings.autoMiner.count > 0 && totalComputingPower > 0) {
    // Базовая эффективность майнинга
    let miningEfficiency = state.miningParams.miningEfficiency;
    
    // Применяем бонусы от улучшений
    for (const upgrade of Object.values(state.upgrades)) {
      if (upgrade.purchased && upgrade.effects && upgrade.effects.miningEfficiencyBoost) {
        miningEfficiency *= (1 + Number(upgrade.effects.miningEfficiencyBoost));
      }
    }
    
    // Рассчитываем производство BTC
    const btcProduction = totalComputingPower * miningEfficiency / state.miningParams.networkDifficulty;
    
    // Обновляем производство BTC
    newResources.btc.production = btcProduction;
    newResources.btc.perSecond = btcProduction;
  }
  
  // Обновляем фактические значения ресурсов за прошедшее время
  for (const [resourceId, resource] of Object.entries(newResources)) {
    // Изменение значения ресурса
    let newValue = resource.value + resource.perSecond * deltaTime;
    
    // Ограничиваем значение максимумом
    if (resource.max !== Infinity && newValue > resource.max) {
      newValue = resource.max;
    }
    
    // Не допускаем отрицательные значения
    if (newValue < 0) {
      newValue = 0;
    }
    
    // Обновляем значение ресурса
    newResources[resourceId] = {
      ...resource,
      value: newValue
    };
  }
  
  // Обновляем другие параметры состояния
  return {
    ...state,
    resources: newResources,
    lastUpdate: now,
    gameTime: gameTime
  };
};
