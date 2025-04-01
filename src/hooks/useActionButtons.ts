
import { useCallback, useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { GameState } from '@/context/types';

interface ActionButtonsHookProps {
  onAddEvent: (message: string, type: string) => void;
}

// Функция для проверки, разблокирована ли кнопка "Применить знания" на основе счетчика кликов
const isApplyKnowledgeUnlocked = (state: GameState): boolean => {
  // Проверяем наличие флага разблокировки
  if (state.unlocks.applyKnowledge === true) return true;
  
  // Проверяем наличие счетчика кликов знаний
  const counter = state.counters.knowledgeClicks;
  
  if (!counter) return false;
  
  // Получаем значение счетчика
  const count = typeof counter === 'object' ? counter.value : counter;
  
  // Кнопка "Применить знания" разблокируется после 3-х нажатий на "Изучить крипту"
  return count >= 3;
};

export const useActionButtons = ({ onAddEvent }: ActionButtonsHookProps) => {
  const { state, dispatch } = useGame();
  const [currentExchangeRate, setCurrentExchangeRate] = useState(state.miningParams?.exchangeRate || 20000);
  
  // Получаем состояние зданий и ресурсов
  const { buildings, resources, unlocks, upgrades } = state;
  
  // Проверяем, должна ли кнопка изучения быть скрыта
  // Кнопка скрывается, если скорость производства знаний >= 10/сек
  const shouldHideLearnButton = (resources.knowledge?.perSecond || 0) >= 10;
  
  // Проверка разблокировки кнопки "Применить знания"
  const applyKnowledgeUnlocked = isApplyKnowledgeUnlocked(state);
  
  // Проверка наличия автомайнера
  const hasAutoMiner = buildings.autoMiner && buildings.autoMiner.count > 0;
  
  // ИСПРАВЛЕНО: Более явная проверка наличия улучшения "Основы криптовалют"
  // Проверяем все возможные ID для этого исследования
  const cryptoCurrencyBasicsPurchased = 
    (upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased) ||
    (upgrades.cryptoBasics && upgrades.cryptoBasics.purchased);
  
  // ИСПРАВЛЕНО: Значение бонуса выделено отдельной переменной для удобства отладки
  const knowledgeEfficiencyBonus = cryptoCurrencyBasicsPurchased ? 0.1 : 0; // +10% если исследование куплено
  
  // Обработчик нажатия кнопки "Изучить крипту"
  const handleLearnClick = useCallback(() => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    // Увеличиваем счетчик кликов знаний при каждом клике
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "knowledgeClicks", value: 1 }
    });
    
    // Убираем отправку события в журнал о получении знания
  }, [dispatch]);
  
  // Обработчик для применения всех знаний (теперь это единственная функциональность)
  const handleApplyAllKnowledge = useCallback(() => {
    // Проверяем, достаточно ли знаний для конвертации
    if ((resources.knowledge?.value || 0) < 10) {
      onAddEvent(`Недостаточно знаний! Требуется минимум 10`, "error");
      return;
    }
    
    console.log("handleApplyAllKnowledge: Начало применения всех знаний");
    console.log("handleApplyAllKnowledge: Текущее состояние:", {
      knowledgeValue: resources.knowledge?.value,
      usdtValue: resources.usdt?.value,
      usdtUnlocked: resources.usdt?.unlocked,
      applyKnowledgeCounter: state.counters.applyKnowledge,
      cryptoBasicsPurchased: cryptoCurrencyBasicsPurchased,
      knowledgeEfficiencyBonus: knowledgeEfficiencyBonus
    });
    
    // ИСПРАВЛЕНО: Сначала вычисляем базовую ставку конвертации
    // и явно передаём её в действие APPLY_ALL_KNOWLEDGE
    let usdtRate = 1;
    
    // Применяем бонус если есть исследование "Основы криптовалют"
    if (cryptoCurrencyBasicsPurchased) {
      usdtRate = 1 + knowledgeEfficiencyBonus; // 1.1 при наличии бонуса
      console.log(`Применяем бонус к конвертации знаний: ${usdtRate.toFixed(2)}`);
    }
    
    // Вызываем действие для применения всех знаний с передачей ставки конвертации
    dispatch({ 
      type: "APPLY_ALL_KNOWLEDGE", 
      payload: { conversionRate: usdtRate } 
    });
    
    // Количество применённых знаний
    const knowledgeValue = resources.knowledge?.value || 0;
    const conversions = Math.floor(knowledgeValue / 10);
    const obtainedUsdt = Math.floor(conversions * usdtRate);
    
    // Показываем уведомление с учетом бонуса
    onAddEvent(`Все знания успешно применены! Получено ${obtainedUsdt} USDT`, "success");
    
    // Принудительно проверяем разблокировки после применения знаний
    setTimeout(() => {
      console.log("handleApplyAllKnowledge: Принудительное обновление после APPLY_ALL_KNOWLEDGE");
      dispatch({ type: "FORCE_RESOURCE_UPDATE" });
      
      // Проверяем состояние после обновления
      setTimeout(() => {
        console.log("handleApplyAllKnowledge: Проверка состояния после FORCE_RESOURCE_UPDATE:", {
          knowledgeValue: state.resources.knowledge?.value,
          usdtValue: state.resources.usdt?.value,
          usdtUnlocked: state.resources.usdt?.unlocked,
          applyKnowledgeCounter: state.counters.applyKnowledge
        });
      }, 100);
    }, 100);
  }, [dispatch, onAddEvent, cryptoCurrencyBasicsPurchased, knowledgeEfficiencyBonus, resources.knowledge?.value, resources.usdt?.value, resources.usdt?.unlocked, state.counters.applyKnowledge]);
  
  // Обработчик обмена Bitcoin на USDT
  const handleExchangeBitcoin = useCallback(() => {
    // Безопасно получаем текущее количество Bitcoin для отображения в сообщении
    const bitcoinAmount = resources.bitcoin?.value || 0;
    
    // Расчет получаемого USDT на основе текущего курса и комиссии
    const bitcoinPrice = currentExchangeRate;
    const commission = state.miningParams?.exchangeCommission || 0.05;
    
    const usdtAmountBeforeCommission = bitcoinAmount * bitcoinPrice;
    const commissionAmount = usdtAmountBeforeCommission * commission;
    const finalUsdtAmount = usdtAmountBeforeCommission - commissionAmount;
    
    // Форматирование чисел с защитой от null
    const safeFormatBitcoin = (value: number) => 
      value !== null && value !== undefined ? value.toFixed(8) : "0.00000000";
      
    const safeFormatUsdt = (value: number) => 
      value !== null && value !== undefined ? value.toFixed(2) : "0.00";
    
    console.log("handleExchangeBitcoin: Вызов обмена Bitcoin", {
      bitcoinAmount,
      bitcoinPrice,
      commission,
      finalUsdtAmount
    });
    
    dispatch({ type: "EXCHANGE_BTC" });
    
    // Более детальное сообщение для журнала событий
    onAddEvent(
      `Обменяны ${safeFormatBitcoin(bitcoinAmount)} Bitcoin на ${safeFormatUsdt(finalUsdtAmount)} USDT по курсу ${bitcoinPrice}`, 
      "success"
    );
  }, [dispatch, onAddEvent, currentExchangeRate, resources.bitcoin?.value, state.miningParams?.exchangeCommission]);
  
  // Функция проверки доступности кнопки
  const isButtonEnabled = useCallback((resourceId: string, cost: number) => {
    const resource = resources[resourceId];
    return resource && (resource.value || 0) >= cost;
  }, [resources]);
  
  // Обновление курса обмена Bitcoin
  useEffect(() => {
    if (state.miningParams?.exchangeRate) {
      setCurrentExchangeRate(state.miningParams.exchangeRate);
    }
  }, [state.miningParams?.exchangeRate]);
  
  return {
    handleLearnClick,
    handleApplyAllKnowledge,
    handleExchangeBitcoin,
    isButtonEnabled,
    hasAutoMiner,
    currentExchangeRate,
    shouldHideLearnButton,
    knowledgeEfficiencyBonus,
    applyKnowledgeUnlocked
  };
};
