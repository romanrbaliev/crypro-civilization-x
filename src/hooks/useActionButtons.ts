
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

// Функция для проверки, разблокирована ли практика на основе счетчика и флага unlocks
const isPracticeUnlocked = (state: GameState): boolean => {
  // Проверяем наличие флага практики в unlocks
  if (state.unlocks.practice === true) return true;
  
  // Проверяем существование здания практики и его разблокировку
  if (state.buildings.practice && state.buildings.practice.unlocked) return true;
  
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
  
  // Проверка разблокировки флага практики
  const practiceUnlockFlag = unlocks.practice === true;
  
  // Проверка разблокировки кнопки "Применить знания"
  const applyKnowledgeUnlocked = isApplyKnowledgeUnlocked(state);
  
  // Объединенная проверка разблокировки практики
  const practiceIsUnlocked = practiceUnlockFlag || practiceBuildingUnlocked || isPracticeUnlocked(state);
  
  console.log("Проверка разблокировки практики в useActionButtons:", {
    practiceUnlockFlag,
    practiceBuildingUnlocked,
    practiceIsUnlocked,
    applyKnowledgeCounter: state.counters.applyKnowledge
  });
  
  // Получение текущей стоимости и уровня практики
  const practiceCurrentLevel = practiceBuildingExists ? buildings.practice.count : 0;
  const practiceBaseCost = 10; // Базовая стоимость согласно таблице
  const practiceCostMultiplier = 1.12; // Множитель стоимости согласно таблице
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
      applyKnowledgeCounter: state.counters.applyKnowledge
    });
    
    // Вызываем действие для применения всех знаний
    dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
    
    // Базовая награда за применение знаний
    let usdtRate = 1;
    
    // Применяем бонус если есть исследование "Основы криптовалют"
    if (cryptoCurrencyBasicsPurchased) {
      usdtRate = Math.floor(usdtRate * (1 + knowledgeEfficiencyBonus));
    }
    
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
  
  // Обработчик покупки практики
  const handlePractice = useCallback(() => {
    if (resources.usdt?.value >= practiceCurrentCost) {
      console.log("Вызов action PRACTICE_PURCHASE");
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
    knowledgeEfficiencyBonus,
    applyKnowledgeUnlocked
  };
};
