
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
  
  console.log(`Куплено исследование ${upgradeId} с эффектами:`, upgrade.effect);
  
  // Если приобретены "Основы блокчейна", разблокируем криптокошелек
  if (upgradeId === 'basicBlockchain' || upgradeId === 'blockchain_basics') {
    // Разблокируем криптокошелек (используем безопасное обновление)
    const newBuildings = { ...state.buildings };
    
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
    let stateAfterPurchase = {
      ...state,
      resources: newResources,
      upgrades: newUpgrades,
      buildings: newBuildings
    };
    
    // Применяем изменения максимальных значений ресурсов
    stateAfterPurchase = updateResourceMaxValues(stateAfterPurchase);
    
    // Применяем эффекты исследования "Основы блокчейна"
    if (upgrade.effect) {
      Object.entries(upgrade.effect).forEach(([effectId, amount]) => {
        // Если эффект влияет на скорость накопления знаний
        if (effectId === 'knowledgeBoost' && stateAfterPurchase.resources.knowledge) {
          const currentPerSecond = stateAfterPurchase.resources.knowledge.perSecond || 0;
          const boost = Number(amount);
          
          // Увеличиваем скорость накопления знаний на соответствующий процент
          stateAfterPurchase = {
            ...stateAfterPurchase,
            resources: {
              ...stateAfterPurchase.resources,
              knowledge: {
                ...stateAfterPurchase.resources.knowledge,
                perSecond: currentPerSecond * (1 + boost)
              }
            }
          };
          
          console.log(`Применен эффект ${effectId}: увеличение скорости знаний на ${boost * 100}%, новая скорость: ${stateAfterPurchase.resources.knowledge.perSecond}`);
        }
      });
    }
    
    // Проверяем разблокировки после всех изменений
    return checkUpgradeUnlocks(stateAfterPurchase);
  }
  
  // Для других исследований просто обновляем состояние
  const stateAfterPurchase = {
    ...state,
    resources: newResources,
    upgrades: newUpgrades
  };
  
  // Проверяем разблокировки и обновляем максимальные значения ресурсов
  const stateWithNewUnlocks = checkUpgradeUnlocks(stateAfterPurchase);
  return updateResourceMaxValues(stateWithNewUnlocks);
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
  
  // Проверяем, разблокировано ли исследование "Основы блокчейна" после обновления состояния
  const isBasicBlockchainUnlockedAfter = isBlockchainBasicsUnlocked(newUpgrades);
  
  // Если "Основы блокчейна" были разблокированы в этом обновлении И у пользователя есть реферер
  if (!isBasicBlockchainUnlockedBefore && isBasicBlockchainUnlockedAfter && state.referredBy) {
    console.log('***Активируем реферала при РАЗБЛОКИРОВКЕ "Основы блокчейна"***');
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
  
  if (hasChanges) {
    return {
      ...state,
      upgrades: newUpgrades
    };
  }
  
  return state;
};
