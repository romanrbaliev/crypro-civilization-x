
import { GameState, Upgrade } from "@/context/types";

// Проверяет, соответствует ли состояние игры условиям разблокировки
export const checkUnlockConditions = (state: GameState, upgrade: Upgrade): boolean => {
  // Если требуется определенное количество ресурсов
  if (upgrade.unlockCondition?.resources) {
    for (const [resourceId, amount] of Object.entries(upgrade.unlockCondition.resources)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
  }

  // Если требуется определенное количество зданий
  if (upgrade.unlockCondition?.buildings) {
    for (const [buildingId, count] of Object.entries(upgrade.unlockCondition.buildings)) {
      const building = state.buildings[buildingId];
      if (!building || building.count < count) {
        return false;
      }
    }
  }

  // Проверка требований по ресурсам (устаревший формат)
  if (upgrade.requirements) {
    for (const [resourceId, amount] of Object.entries(upgrade.requirements)) {
      // Специальная обработка для требований по зданиям
      if (resourceId.includes('Count')) {
        const buildingId = resourceId.replace('Count', '');
        if (!state.buildings[buildingId] || state.buildings[buildingId].count < amount) {
          return false;
        }
        continue;
      }
      
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
  }

  // Если требуются другие улучшения
  if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
    for (const requiredUpgradeId of upgrade.requiredUpgrades) {
      if (!state.upgrades[requiredUpgradeId] || !state.upgrades[requiredUpgradeId].purchased) {
        return false;
      }
    }
  }

  return true;
};

// Проверяет, разблокировано ли исследование "Основы блокчейна"
export const isBlockchainBasicsUnlocked = (upgrades: { [key: string]: Upgrade }): boolean => {
  // Добавим подробные логи для отладки
  const basicBlockchainUnlock = upgrades['basicBlockchain']?.unlocked || false;
  const blockchainBasicsUnlock = upgrades['blockchain_basics']?.unlocked || false;
  
  console.log('Проверка разблокировки исследования "Основы блокчейна" в интерфейсе:', 
    basicBlockchainUnlock || blockchainBasicsUnlock ? 'ДА' : 'НЕТ');

  // Проверяем как новый, так и старый ID исследования
  return basicBlockchainUnlock || blockchainBasicsUnlock;
};

// Проверяет, куплено ли исследование "Основы блокчейна"
export const hasBlockchainBasics = (upgrades: { [key: string]: Upgrade }): boolean => {
  // Добавим подробные логи для отладки
  const basicBlockchainPurchased = upgrades['basicBlockchain']?.purchased || false;
  const blockchainBasicsPurchased = upgrades['blockchain_basics']?.purchased || false;
  
  console.log('Пользователь', 
    basicBlockchainPurchased || blockchainBasicsPurchased ? 'ИМЕЕТ' : 'НЕ имеет',
    'купленное исследование "Основы блокчейна"');

  // Проверяем как новый, так и старый ID исследования
  return basicBlockchainPurchased || blockchainBasicsPurchased;
};

// Форматирование название эффекта для отображения
export const formatEffectName = (effectId: string): string => {
  const effectMap: { [key: string]: string } = {
    'knowledge_max': 'Максимум знаний',
    'knowledge_rate': 'Скорость получения знаний',
    'energy_max': 'Максимум энергии',
    'energy_rate': 'Скорость генерации энергии',
    'mining_efficiency': 'Эффективность майнинга',
    'usdt_max': 'Максимум USDT',
    'click_power': 'Сила клика',
    'computing_power_rate': 'Вычислительная мощность',
    'trading_efficiency': 'Эффективность трейдинга',
    'altcoin_earnings': 'Доход от альткоинов',
    'reputation_gain': 'Прирост репутации',
    'staking_efficiency': 'Эффективность стейкинга',
    'referal_bonus': 'Бонус от рефералов',
    'hashrate_efficiency': 'Эффективность хешрейта',
    'offline_production': 'Оффлайн-производство',
    'building_cost': 'Стоимость зданий',
    'research_speed': 'Скорость исследований',
    'storage_capacity': 'Вместимость хранилищ',
    'electricity_consumption': 'Потребление электричества',
    'project_development_speed': 'Скорость разработки проектов'
  };
  
  return effectMap[effectId] || effectId;
};

// Форматирование эффекта для отображения, включая значение
export const formatEffect = (effectId: string, value: number): string => {
  const effectName = formatEffectName(effectId);
  
  // Определение знака и форматирование
  const sign = value >= 0 ? '+' : '';
  const formattedValue = `${sign}${value}%`;
  
  // Исключения для отображения без процентов
  const noPercentEffects = ['building_count', 'resource_amount'];
  const format = noPercentEffects.includes(effectId) ? value.toString() : formattedValue;
  
  return `${effectName}: ${format}`;
};

// Получение названия специализации по идентификатору
export const getSpecializationName = (specializationId: string): string => {
  const specializationMap: {[key: string]: string} = {
    'miner': 'Майнер',
    'trader': 'Трейдер', 
    'investor': 'Инвестор',
    'influencer': 'Инфлюенсер',
    'defi': 'DeFi',
    'founder': 'Основатель',
    'analyst': 'Аналитик',
    'arbitrage': 'Арбитражник',
    'general': 'Общее'
  };
  
  return specializationMap[specializationId] || specializationId;
};
