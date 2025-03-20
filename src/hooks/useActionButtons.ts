
import { useState, useEffect, useMemo } from "react";
import { useGame } from "@/context/hooks/useGame";

export interface UseActionButtonsProps {
  onAddEvent?: (message: string, type?: string) => void;
}

export function useActionButtons({ onAddEvent = () => {} }: UseActionButtonsProps) {
  const { state, dispatch } = useGame();
  const [practiceMessageSent, setPracticeMessageSent] = useState(false);
  const [researchMessageSent, setResearchMessageSent] = useState(false);

  // Отслеживаем прогресс для разблокировки практики
  useEffect(() => {
    // Проверяем, была ли кнопка "Применить знания" использована 2 раза
    if (state.counters.applyKnowledge && state.counters.applyKnowledge.value >= 2 && !state.unlocks.practice) {
      console.log("Разблокируем практику после 2 применений знаний");
      dispatch({ type: "UNLOCK_FEATURE", payload: { featureId: "practice" } });
      
      if (state.buildings.practice && !state.buildings.practice.unlocked) {
        dispatch({
          type: "SET_BUILDING_UNLOCKED",
          payload: { buildingId: "practice", unlocked: true }
        });
      }
    }
  }, [state.counters.applyKnowledge, state.unlocks.practice, dispatch, state.buildings.practice]);

  // Отправляем сообщение когда практика разблокирована
  useEffect(() => {
    if (state.unlocks.practice && !practiceMessageSent) {
      onAddEvent("Функция 'Практика' разблокирована", "info");
      onAddEvent("Накопите USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      setPracticeMessageSent(true);
    }
  }, [state.unlocks.practice, onAddEvent, practiceMessageSent]);
  
  // Отправляем сообщение когда исследования разблокированы
  useEffect(() => {
    if (state.unlocks.research && !researchMessageSent) {
      onAddEvent("Вкладка 'Исследования' разблокирована", "success");
      onAddEvent("Теперь вы можете изучать новые технологии", "info");
      setResearchMessageSent(true);
    }
  }, [state.unlocks.research, onAddEvent, researchMessageSent]);

  // Обработчик для кнопки "Изучить крипту"
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    if (state.resources.knowledge.value === 2 && !state.unlocks.applyKnowledge) {
      onAddEvent("Изучите еще немного, и вы сможете применить свои знания!", "info");
    }
  };

  // Обработчик для кнопки "Применить знания"
  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
    
    // Увеличиваем счетчик применений знаний
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "applyKnowledge", value: 1 } 
    });
    
    // Проверяем количество применений и разблокируем практику после второго применения
    if (state.counters.applyKnowledge && state.counters.applyKnowledge.value === 1) {
      onAddEvent("Еще раз примените знания, чтобы разблокировать новую функцию", "info");
    }
  };

  // Обработчик для кнопки "Практиковаться"
  const handlePractice = () => {
    // Проверяем наличие здания practice
    if (!state.buildings.practice) {
      console.error("Ошибка: здание practice не найдено в state.buildings");
      onAddEvent("Произошла ошибка при попытке практиковаться", "error");
      return;
    }
    
    // Проверяем разблокировку функции
    if (!state.unlocks.practice) {
      console.error("Функция practice не разблокирована!");
      return;
    }
    
    // Проверяем разблокировку здания
    if (!state.buildings.practice.unlocked) {
      console.log("Разблокируем здание practice, т.к. функция уже разблокирована");
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "practice", unlocked: true } 
      });
      return;
    }
    
    // Расчет стоимости
    const practiceBuilding = state.buildings.practice;
    const currentCost = Math.floor(practiceBuilding.cost.usdt * Math.pow(practiceBuilding.costMultiplier, practiceBuilding.count));
    
    console.log(`Нажата кнопка Практиковаться. USDT: ${state.resources.usdt.value}, Требуется: ${currentCost}`);
    
    // Проверка ресурсов
    if (state.resources.usdt.value < currentCost) {
      onAddEvent(`Недостаточно USDT! Требуется ${currentCost} единиц.`, "error");
      return;
    }
    
    // Отправляем действие для покупки практики
    dispatch({ type: "PRACTICE_PURCHASE" });
    onAddEvent(`Практика улучшена до уровня ${practiceBuilding.count + 1}`, "success");
    console.log("Отправлен запрос PRACTICE_PURCHASE");
  };

  // Обработчик для кнопки "Майнинг"
  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };

  // Обработчик для кнопки "Обменять BTC"
  const handleExchangeBtc = () => {
    if (state.resources.btc.value <= 0) {
      onAddEvent("У вас нет BTC для обмена", "error");
      return;
    }
    
    dispatch({ type: "EXCHANGE_BTC" });
  };

  // Расчет текущего курса обмена BTC на USDT
  const currentExchangeRate = useMemo(() => {
    if (!state.miningParams) return 100000;
    
    return state.miningParams.exchangeRate * 
      (1 + state.miningParams.volatility * Math.sin(state.gameTime / state.miningParams.exchangePeriod));
  }, [state.miningParams, state.gameTime]);

  // Вспомогательная функция для проверки доступности ресурсов
  const isButtonEnabled = (requiredResource: string, amount: number): boolean => {
    return state.resources[requiredResource] && state.resources[requiredResource].value >= amount;
  };

  // Вычисления для кнопок
  const practiceBuildingExists = Boolean(state.buildings.practice);
  const practiceIsUnlocked = practiceBuildingExists && state.buildings.practice.unlocked;
  const practiceCurrentCost = practiceBuildingExists
    ? Math.floor(state.buildings.practice.cost.usdt * Math.pow(state.buildings.practice.costMultiplier, state.buildings.practice.count))
    : 10;
  const practiceCurrentLevel = practiceBuildingExists ? state.buildings.practice.count : 0;
  const hasAutoMiner = state.buildings.autoMiner && state.buildings.autoMiner.count > 0;

  return {
    state,
    handleLearnClick,
    handleApplyKnowledge,
    handlePractice,
    handleMineClick,
    handleExchangeBtc,
    isButtonEnabled,
    practiceBuildingExists,
    practiceIsUnlocked,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate
  };
}
