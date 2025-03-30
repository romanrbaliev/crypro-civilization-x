import { useCallback, useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { GameState } from '@/context/types';

interface ActionButtonsHookProps {
  onAddEvent: (message: string, type: string) => void;
}

// Функция для проверки, разблокирована ли практика на основе счетчика
const isPracticeUnlocked = (state: GameState): boolean => {
  // Проверяем наличие счетчика применения знаний
  const counter = state.counters.applyKnowledge;
  
  if (!counter) return false;
  
  // Получаем значение счетчика
  const count = typeof counter === 'object' ? counter.value : counter;
  
  // Практика разблокируется после 2-х использований "Применить знания"
  return count >= 2;
};

export const useActionButtons = ({ onAddEvent }: ActionButtonsHookProps) => {
  const { state, dispatch } = useGame();
  const [currentExchangeRate, setCurrentExchangeRate] = useState(state.miningParams?.exchangeRate || 20000);
  
  // Получаем состояние зданий и ресурсов
  const { buildings, resources, unlocks, upgrades } = state;
  
  // Проверяем, должна ли кнопка изучения быть скрыта
  // Кнопка скрывается, если скорость производства знаний >= 10/сек
  const shouldHideLearnButton = resources.knowledge?.perSecond >= 10;
  
  // Проверка наличия и разблокировки здания практики
  const practiceBuildingExists = !!buildings.practice;
  const practiceBuildingUnlocked = practiceBuildingExists && buildings.practice.unlocked;
  
  // Проверка разблокировки флага практики (должно совпадать с зданием)
  const practiceUnlockFlag = unlocks.practice === true;
  
  // Объединенная проверка разблокировки практики
  const practiceIsUnlocked = practiceUnlockFlag || practiceBuildingUnlocked;
  
  // Получение текущей стоимости и уровня практики
  const practiceCurrentLevel = practiceBuildingExists ? buildings.practice.count : 0;
  const practiceBaseCost = practiceBuildingExists ? buildings.practice.cost.usdt : 10;
  const practiceCostMultiplier = practiceBuildingExists ? buildings.practice.costMultiplier || 1.15 : 1.15;
  const practiceCurrentCost = Math.floor(practiceBaseCost * Math.pow(practiceCostMultiplier, practiceCurrentLevel));
  
  // Проверка наличия автомайнера
  const hasAutoMiner = buildings.autoMiner && buildings.autoMiner.count > 0;
  
  // Проверка наличия улучшений для эффективности применения знаний
  const cryptoCurrencyBasicsPurchased = upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased;
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
    // Не отправляем событие "Получено 1 знание" в журнал
  }, [dispatch]);
  
  // Обработчик нажатия кнопки "Применить знания"
  const handleApplyKnowledge = useCallback(() => {
    dispatch({ type: "APPLY_KNOWLEDGE" });
    // Увеличиваем счетчик применений знаний
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "applyKnowledge", value: 1 }
    });
    
    // Базовая награда за применение знаний
    let usdtReward = 1;
    
    // Применяем бонус если есть исследование "Основы криптовалют"
    if (cryptoCurrencyBasicsPurchased) {
      usdtReward = Math.floor(usdtReward * (1 + knowledgeEfficiencyBonus));
    }
    
    // Показываем уведомление с учетом бонуса
    onAddEvent(`Знания успешно применены! Получено ${usdtReward} USDT`, "success");
  }, [dispatch, onAddEvent, cryptoCurrencyBasicsPurchased, knowledgeEfficiencyBonus]);
  
  // Обработчик для применения всех знаний
  const handleApplyAllKnowledge = useCallback(() => {
    dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
    // Увеличиваем счетчик применений знаний
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "applyKnowledge", value: 1 }
    });
    
    // Базовая награда за применение знаний
    let usdtRate = 1;
    
    // Применяем бонус если есть исследование "Основы криптовалют"
    if (cryptoCurrencyBasicsPurchased) {
      usdtRate = Math.floor(usdtRate * (1 + knowledgeEfficiencyBonus));
    }
    
    // Количество применённых знаний
    const appliedKnowledge = resources.knowledge?.value || 0;
    // Расчёт полученных USDT
    const obtainedUsdt = Math.floor((appliedKnowledge / 10) * usdtRate);
    
    // Показываем уведомление с учетом бонуса
    onAddEvent(`Все знания успешно применены! Получено ${obtainedUsdt} USDT`, "success");
  }, [dispatch, onAddEvent, cryptoCurrencyBasicsPurchased, knowledgeEfficiencyBonus, resources.knowledge?.value]);
  
  // Обработчик покупки практики
  const handlePractice = useCallback(() => {
    if (resources.usdt?.value >= practiceCurrentCost) {
      dispatch({ type: "PRACTICE_PURCHASE" });
      onAddEvent(`Куплена практика (уровень ${practiceCurrentLevel + 1})`, "success");
    } else {
      onAddEvent("Недостаточно USDT для покупки практики", "error");
    }
  }, [dispatch, onAddEvent, resources.usdt?.value, practiceCurrentCost, practiceCurrentLevel]);
  
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
    
    console.log("handleExchangeBitcoin: Вызов обмена Bitcoin", {
      bitcoinAmount,
      bitcoinPrice,
      commission,
      finalUsdtAmount
    });
    
    dispatch({ type: "EXCHANGE_BTC" });
    
    // Более детальное сообщение для журнала событий
    onAddEvent(
      `Обменяны ${bitcoinAmount.toFixed(8)} Bitcoin на ${finalUsdtAmount.toFixed(2)} USDT по курсу ${bitcoinPrice}`, 
      "success"
    );
  }, [dispatch, onAddEvent, currentExchangeRate, resources.bitcoin?.value, state.miningParams?.exchangeCommission]);
  
  // Функция проверки доступности кнопки
  const isButtonEnabled = useCallback((resourceId: string, cost: number) => {
    const resource = resources[resourceId];
    return resource && resource.value >= cost;
  }, [resources]);
  
  // Обновление курса обмена Bitcoin
  useEffect(() => {
    if (state.miningParams?.exchangeRate) {
      setCurrentExchangeRate(state.miningParams.exchangeRate);
    }
  }, [state.miningParams?.exchangeRate]);
  
  return {
    handleLearnClick,
    handleApplyKnowledge,
    handleApplyAllKnowledge,
    handlePractice,
    handleExchangeBitcoin,
    isButtonEnabled,
    practiceIsUnlocked,
    practiceBuildingExists,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate,
    shouldHideLearnButton,
    knowledgeEfficiencyBonus
  };
};
