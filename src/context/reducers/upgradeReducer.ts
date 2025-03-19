
import { GameState } from '../types';
import { hasEnoughResources, updateResourceMaxValues } from '../utils/resourceUtils';
import { safeDispatchGameEvent } from '../utils/eventBusUtils';
import { checkUnlockConditions, isBlockchainBasicsUnlocked, hasBlockchainBasics } from '@/utils/researchUtils';
import { activateReferral } from '@/api/referralService';

// Обработка покупки улучшений
export const processPurchaseUpgrade = (
  state: GameState,
  payload: { upgradeId: string }
): GameState => {
  const { upgradeId } = payload;
  const upgrade = state.upgrades[upgradeId];
  
  // Если улучшение не существует, не разблокировано или уже куплено, возвращаем текущее состояние
  if (!upgrade || !upgrade.unlocked || upgrade.purchased) {
    return state;
  }
  
  // Проверяем, хватает ли ресурсов
  const canAfford = hasEnoughResources(state, upgrade.cost);
  if (!canAfford) {
    return state;
  }
  
  // Вычитаем ресурсы
  const newResources = { ...state.resources };
  for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
    newResources[resourceId] = {
      ...newResources[resourceId],
      value: newResources[resourceId].value - cost
    };
  }
  
  // Помечаем улучшение как купленное
  const newUpgrades = {
    ...state.upgrades,
    [upgradeId]: {
      ...upgrade,
      purchased: true
    }
  };
  
  console.log(`Куплено исследование ${upgradeId} с эффектами:`, upgrade.effects || upgrade.effect || {});
  
  // Создаем новое состояние после покупки улучшения
  let stateAfterPurchase = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades,
  };
  
  // Применяем эффекты улучшения
  const effects = upgrade.effects || upgrade.effect || {};
  
  // Проходим по всем эффектам и применяем их
  if (Object.keys(effects).length > 0) {
    console.log(`Применяем эффекты исследования ${upgradeId}:`, effects);
    
    // Создаем глубокую копию ресурсов для безопасного обновления
    const updatedResources = JSON.parse(JSON.stringify(newResources));
    
    Object.entries(effects).forEach(([effectId, amount]) => {
      const numAmount = Number(amount);
      
      // Обработка бонусов к скорости накопления
      if (effectId === 'knowledgeBoost') {
        console.log(`Применяем эффект knowledgeBoost: +${numAmount * 100}%`);
        if (updatedResources.knowledge) {
          const baseProduction = updatedResources.knowledge.baseProduction || 0;
          updatedResources.knowledge.production += baseProduction * numAmount;
          updatedResources.knowledge.perSecond += baseProduction * numAmount;
          
          console.log(`Увеличение скорости накопления знаний на ${numAmount * 100}%, 
            новая скорость: ${updatedResources.knowledge.perSecond}/сек`);
        }
      }
      
      // Обработка бонусов к максимальному хранению
      else if (effectId === 'knowledgeMaxBoost') {
        console.log(`Применяем эффект knowledgeMaxBoost: +${numAmount * 100}%`);
        if (updatedResources.knowledge) {
          const baseMax = updatedResources.knowledge.max || 100;
          const boost = baseMax * numAmount;
          updatedResources.knowledge.max += boost;
          
          console.log(`Увеличение максимума знаний на ${numAmount * 100}%, 
            новый максимум: ${updatedResources.knowledge.max}`);
          
          safeDispatchGameEvent(`Увеличен максимум знаний на ${numAmount * 100}%`, "success");
        }
      }
      
      // Обработка бонусов к максимальному хранению USDT
      else if (effectId === 'usdtMaxBoost') {
        console.log(`Применяем эффект usdtMaxBoost: +${numAmount * 100}%`);
        if (updatedResources.usdt) {
          const baseMax = updatedResources.usdt.max || 50;
          const boost = baseMax * numAmount;
          updatedResources.usdt.max += boost;
          
          console.log(`Увеличение максимума USDT на ${numAmount * 100}%, 
            новый максимум: ${updatedResources.usdt.max}`);
          
          safeDispatchGameEvent(`Увеличен максимум USDT на ${numAmount * 100}%`, "success");
        }
      }
      
      // Общая обработка бустов и максимумов для других ресурсов
      else if (effectId.includes('Boost') && !effectId.includes('Max')) {
        const resourceId = effectId.replace('Boost', '');
        console.log(`Применяем эффект ${effectId} для ресурса ${resourceId}: +${numAmount * 100}%`);
        if (updatedResources[resourceId]) {
          const baseProduction = updatedResources[resourceId].baseProduction || 0;
          updatedResources[resourceId].production += baseProduction * numAmount;
          updatedResources[resourceId].perSecond += baseProduction * numAmount;
        }
      }
    });
    
    stateAfterPurchase = {
      ...stateAfterPurchase,
      resources: updatedResources
    };
  }
  
  // Если приобретены "Основы блокчейна", разблокируем криптокошелек
  if (upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    // Разблокируем криптокошелек
    const newBuildings = { ...stateAfterPurchase.buildings };
    
    // Проверяем существование криптокошелька перед обновлением
    if (newBuildings.cryptoWallet) {
      newBuildings.cryptoWallet = {
        ...newBuildings.cryptoWallet,
        unlocked: true
      };
      console.log("Разблокирован криптокошелек из-за исследования 'Основы блокчейна'");
      
      // Отправляем сообщение о разблокировке криптокошелька
      safeDispatchGameEvent("Разблокирован криптокошелек", "info");
      
      // Добавлен описательное сообщение о криптокошельке
      setTimeout(() => {
        safeDispatchGameEvent("Криптокошелек увеличивает максимальное хранение USDT и знаний", "info");
      }, 200);
    } else {
      console.warn("Внимание: cryptoWallet не найден в зданиях при обновлении после покупки исследования");
    }
    
    // Обновляем состояние
    stateAfterPurchase = {
      ...stateAfterPurchase,
      buildings: newBuildings
    };
    
    // Активируем реферала при покупке исследования "Основы блокчейна"
    if (state.referredBy) {
      console.log('***Активируем реферала при ПОКУПКЕ "Основы блокчейна"***');
      console.log('Пригласивший пользователь:', state.referredBy);
      
      // Запоминаем текущий userId для активации как реферала
      const userId = window.__game_user_id || 'unknown';
      console.log('Текущий userId для активации:', userId);
      
      // Асинхронно активируем реферала
      try {
        // Немедленно отправляем событие о начале активации
        safeDispatchGameEvent("Уведомляем вашего реферера о прогрессе...", "info");
        
        // Устанавливаем небольшую задержку, чтобы пользователь увидел сообщение
        setTimeout(() => {
          activateReferral(userId)
            .then(result => {
              console.log('Результат активации реферала для', userId, ':', result);
              if (result) {
                safeDispatchGameEvent("Ваш реферер получил бонус за ваше развитие!", "success");
              } else {
                console.warn("Активация реферала не удалась");
                safeDispatchGameEvent("Не удалось отправить уведомление рефереру", "warning");
              }
            })
            .catch(error => {
              console.error("Ошибка при активации реферала:", error);
              safeDispatchGameEvent("Ошибка при отправке уведомления рефереру", "error");
            });
        }, 1000);
      } catch (error) {
        console.error("Критическая ошибка при активации реферала:", error);
      }
    }
  }
  
  try {
    // Применяем изменения максимальных значений ресурсов
    stateAfterPurchase = updateResourceMaxValues(stateAfterPurchase);
  } catch (error) {
    console.error("Ошибка при обновлении максимальных значений ресурсов:", error);
  }
  
  // Проверяем разблокировки после всех изменений
  try {
    const stateWithNewUnlocks = checkUpgradeUnlocks(stateAfterPurchase);
    return stateWithNewUnlocks;
  } catch (error) {
    console.error("Ошибка при проверке разблокировок:", error);
    return stateAfterPurchase;
  }
};

// Проверка разблокировки улучшений на основе зависимостей
export const checkUpgradeUnlocks = (state: GameState): GameState => {
  // Важное изменение: проверяем, разблокировано ли исследование "Основы блокчейна"
  // при этом проверка должна выполниться перед обновлением состояния
  const isBasicBlockchainUnlockedBefore = isBlockchainBasicsUnlocked(state.upgrades);
  
  const newUpgrades = { ...state.upgrades };
  let hasChanges = false;
  
  Object.values(newUpgrades).forEach(upgrade => {
    // Пропускаем уже разблокированные или купленные улучшения
    if (upgrade.unlocked || upgrade.purchased) return;
    
    // Проверяем, выполнены ли условия для разблокировки
    const shouldUnlock = checkUnlockConditions(state, upgrade);
    
    if (shouldUnlock) {
      newUpgrades[upgrade.id] = {
        ...upgrade,
        unlocked: true
      };
      hasChanges = true;
      
      // Отправляем сообщение о разблокировке нового исследования
      const categoryText = upgrade.category ? ` (${upgrade.specialization || upgrade.category})` : '';
      safeDispatchGameEvent(`Разблокировано новое исследование: ${upgrade.name}${categoryText}`, "info");
    }
  });
  
  if (hasChanges) {
    return {
      ...state,
      upgrades: newUpgrades
    };
  }
  
  return state;
};
