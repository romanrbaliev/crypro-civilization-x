
import { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";

export interface UseActionButtonsProps {
  onAddEvent?: (message: string, type?: string) => void;
}

export function useActionButtons({ onAddEvent = () => {} }: UseActionButtonsProps) {
  const { state, dispatch } = useGame();
  const [practiceMessageSent, setPracticeMessageSent] = useState(false);

  // Следим за разблокировкой практики
  useEffect(() => {
    console.log(
      "practice unlocked =", state.unlocks.practice,
      "practice building unlocked =", state.buildings.practice ? state.buildings.practice.unlocked : false,
      "practice building count =", state.buildings.practice ? state.buildings.practice.count : 0
    );
  }, [state.unlocks.practice, state.buildings.practice]);

  // Отправляем сообщение когда практика разблокирована
  useEffect(() => {
    if (state.unlocks.practice && !practiceMessageSent) {
      onAddEvent("Функция 'Практика' разблокирована", "info");
      onAddEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      setPracticeMessageSent(true);
    }
  }, [state.unlocks.practice, onAddEvent, practiceMessageSent]);

  // Обработчики для кнопок
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    if (state.resources.knowledge.value === 2 && !state.unlocks.applyKnowledge) {
      onAddEvent("Изучите еще немного, и вы сможете применить свои знания!", "info");
    }
  };

  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
  };

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
    console.log("Отправлен запрос PRACTICE_PURCHASE");
  };

  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };

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
    isButtonEnabled,
    practiceBuildingExists,
    practiceIsUnlocked,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner
  };
}
