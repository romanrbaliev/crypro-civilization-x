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
  const [currentExchangeRate, setCurrentExchangeRate] = useState(state.miningParams.exchangeRate || 20000);
  
  // Получаем состояние зданий и ресурсов
  const { buildings, resources, unlocks, upgrades } = state;
  
  // Проверяем, должна ли кнопка изучения быть скрыта
  // Кнопка скрывается, если скорость производства знаний >= 10/сек
  const shouldHideLearnButton = resources.knowledge.perSecond >= 10;
  
  // Проверка наличия и разблокировки здания практики
  const practiceBuildingExists = !!buildings.practice;
  const practiceBuildingUnlocked = practiceBuildingExists && buildings.practice.unlocked;
  
  // Проверка разблокировки флага практики (должно совпадать с зданием)
  const practiceUnlockFlag = unlocks.practice === true;
  
  // Объединенная проверка разблокировки практики
  const practiceIsUnlocked = practiceBuildingUnlocked && practiceUnlockFlag;
  
  // Получение текущей стоимости и уровня практики
  const practiceCurrentLevel = practiceBuildingExists ? buildings.practice.count : 0;
  const practiceBaseCost = practiceBuildingExists ? buildings.practice.cost.usdt : 10;
  const practiceCostMultiplier = practiceBuildingExists ? buildings.practice.costMultiplier || 1.15 : 1.15;
  const practiceCurrentCost = Math.floor(practiceBaseCost * Math.pow(practiceCostMultiplier, practiceCurrentLevel));
  
  // Проверка наличия автомайнера
  const hasAutoMiner = buildings.autoMiner && buildings.autoMiner.count > 0;
  
  // Проверка наличия улучшений для эффективности прим��нения знаний
  const cryptoCurrencyBasicsPurchased = upgrades.cryptoCurrencyBasics && upgrades.cryptoCurrencyBasics.purchased;
  const knowledgeEfficiencyBonus = cryptoCurrencyBasicsPurchased ? 0.1 : 0; // +10% если исследование куплено
  
  // Обработчик нажатия кнопки "Изучить крипту"
  const handleLearnClick = useCallback(() => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
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
  
  // Обработчик покупки практики
  const handlePractice = useCallback(() => {
    if (resources.usdt.value >= practiceCurrentCost) {
      dispatch({ type: "PRACTICE_PURCHASE" });
      onAddEvent(`Куплена практика (уровень ${practiceCurrentLevel + 1})`, "success");
    } else {
      onAddEvent("Недостаточно USDT для покупки практики", "error");
    }
  }, [dispatch, onAddEvent, resources.usdt.value, practiceCurrentCost, practiceCurrentLevel]);
  
  // Обработчик обмена BTC на USDT
  const handleExchangeBtc = useCallback(() => {
    dispatch({ type: "EXCHANGE_BTC" });
    onAddEvent(`Обменяны BTC на USDT по курсу ${currentExchangeRate}`, "success");
  }, [dispatch, onAddEvent, currentExchangeRate]);
  
  // Функция проверки доступности кнопки
  const isButtonEnabled = useCallback((resourceId: string, cost: number) => {
    const resource = resources[resourceId];
    return resource && resource.value >= cost;
  }, [resources]);
  
  // Обновление курса обмена BTC
  useEffect(() => {
    setCurrentExchangeRate(state.miningParams.exchangeRate);
  }, [state.miningParams.exchangeRate]);
  
  return {
    handleLearnClick,
    handleApplyKnowledge,
    handlePractice,
    handleExchangeBtc,
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
