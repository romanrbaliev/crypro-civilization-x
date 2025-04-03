
import { GameState } from '../types';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { updateResourceMaxValues } from '../utils/resourceUtils';

// Обработчик покупки улучшения
export const processPurchaseUpgrade = (state: GameState, payload: { upgradeId: string }): GameState => {
  const { upgradeId } = payload;
  
  // Проверяем, существует ли такое улучшение
  if (!state.upgrades[upgradeId]) {
    console.log(`Улучшение с ID ${upgradeId} не найдено`);
    return state;
  }
  
  const upgrade = state.upgrades[upgradeId];
  
  // Проверяем, разблокировано ли улучшение
  if (!upgrade.unlocked) {
    console.log(`Улучшение ${upgrade.name} еще не разблокировано`);
    return state;
  }
  
  // Проверяем, уже куплено ли улучшение
  if (upgrade.purchased) {
    console.log(`Улучшение ${upgrade.name} уже приобретено`);
    return state;
  }
  
  // Проверяем, достаточно ли ресурсов для покупки
  const cost = upgrade.cost;
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < amount) {
      console.log(`Недостаточно ресурса ${resourceId} для покупки ${upgrade.name}`);
      return state;
    }
  }
  
  // Создаем копии для изменения
  const updatedResources = { ...state.resources };
  
  // Вычитаем стоимость
  for (const [resourceId, amount] of Object.entries(cost)) {
    updatedResources[resourceId] = {
      ...updatedResources[resourceId],
      value: updatedResources[resourceId].value - Number(amount)
    };
  }
  
  // Обновляем улучшение
  const updatedUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  // Создаем новое состояние с обновлениями
  let newState = {
    ...state,
    resources: updatedResources,
    upgrades: updatedUpgrades
  };
  
  console.log(`Покупка улучшения: ${upgrade.name} [ID: ${upgradeId}]`);
  
  // Применяем специальные эффекты для конкретных улучшений
  if (upgradeId === 'blockchainBasics' || upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    console.log("Применяем специальные эффекты 'Основы блокчейна'");
    
    // 1. Увеличиваем макс. хранение знаний на 50%
    if (newState.resources.knowledge) {
      const baseMax = newState.resources.knowledge.max || 100; // Базовое значение
      const newMax = baseMax * 1.5; // +50% от текущего значения
      
      newState.resources.knowledge = {
        ...newState.resources.knowledge,
        max: newMax
      };
      
      console.log(`Максимум знаний установлен на ${newMax}`);
    }
    
    // 2. ИСПРАВЛЕНИЕ: Не изменяем perSecond и production здесь, 
    // иначе будет двойное применение с ResourceProductionService
    // Просто устанавливаем эффекты улучшения для корректного применения в других местах
    
    // Обновляем эффекты улучшения, чтобы BonusCalculationService правильно их учитывал
    newState.upgrades[upgradeId] = {
      ...newState.upgrades[upgradeId],
      effects: {
        ...(newState.upgrades[upgradeId].effects || {}),
        knowledgeBoost: 0.1, // Установлено 10%
        knowledgeMaxBoost: 0.5
      }
    };
    
    // 3. ИСПРАВЛЕНО: После "Основы блокчейна" разблокируем "Основы криптовалют", а не "Безопасность криптокошельков"
    if (newState.upgrades.cryptoCurrencyBasics || newState.upgrades.cryptoBasics) {
      const cryptoBasicsId = newState.upgrades.cryptoCurrencyBasics ? 'cryptoCurrencyBasics' : 'cryptoBasics';
      
      newState.upgrades[cryptoBasicsId] = {
        ...newState.upgrades[cryptoBasicsId],
        unlocked: true
      };
      console.log("Исследование 'Основы криптовалют' разблокировано");
    }
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы блокчейна: +50% к макс. хранению знаний, +10% к скорости их получения", "success");
  }
  
  if (upgradeId === 'cryptoWallet' || upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
    // После покупки "Криптокошелька" (или другого триггера) разблокируем "Безопасность криптокошельков"
    if ((upgradeId === 'cryptoWallet') && (newState.upgrades.walletSecurity || newState.upgrades.cryptoWalletSecurity)) {
      const securityUpgradeId = newState.upgrades.walletSecurity ? 'walletSecurity' : 'cryptoWalletSecurity';
      
      newState.upgrades[securityUpgradeId] = {
        ...newState.upgrades[securityUpgradeId],
        unlocked: true
      };
      console.log("Исследование 'Безопасность криптокошельков' разблокировано после покупки Криптокошелька");
    }
  }
  
  if (upgradeId === 'cryptoCurrencyBasics' || upgradeId === 'cryptoBasics') {
    console.log("Применяем эффекты 'Основы криптовалют'");
    
    // 1. Добавляем бонус эффективности применения знаний
    newState.upgrades[upgradeId] = {
      ...newState.upgrades[upgradeId],
      effects: {
        ...(newState.upgrades[upgradeId].effects || {}),
        knowledgeEfficiencyBoost: 0.1
      }
    };
    
    // 2. Разблокируем майнер (проверяем оба возможных ID и принудительно разблокируем)
    console.log("Принудительно разблокируем майнер после изучения 'Основы криптовалют'");
    
    // Разблокируем майнер по всем возможным ID
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
      
      console.log("Майнер (ID: miner) принудительно разблокирован");
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
      
      console.log("Автомайнер (ID: autoMiner) принудительно разблокирован");
    }
    
    // ИСПРАВЛЕНО: Биткоин не разблокируем здесь, а разблокируем только после покупки майнера
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Основы криптовалют: +10% к эффективности применения знаний, разблокирован майнер", "info");
  }
  
  if (upgradeId === 'cryptoWalletSecurity' || upgradeId === 'walletSecurity') {
    console.log("Применяем эффекты 'Безопасность криптокошельков'");
    
    // ИСПРАВЛЕНО: Увеличиваем макс. хранение USDT на 25%
    if (newState.resources.usdt) {
      const currentMax = newState.resources.usdt.max || 100;
      const newMax = currentMax * 1.25; // Точно +25% от текущего значения
      
      newState.resources.usdt = {
        ...newState.resources.usdt,
        max: newMax
      };
      
      console.log(`Максимум USDT увеличен с ${currentMax} до ${newMax}`);
    }
    
    // Добавляем эффекты, если их нет
    newState.upgrades[upgradeId] = {
      ...newState.upgrades[upgradeId],
      effects: {
        ...(newState.upgrades[upgradeId].effects || {}),
        usdtMaxBoost: 0.25
      }
    };
    
    // Отправляем уведомление об эффекте
    safeDispatchGameEvent("Безопасность кошельков: +25% к максимальному хранению USDT", "success");
  }
  
  return newState;
};
