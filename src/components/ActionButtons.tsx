
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGame } from "@/context/GameContext";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [clickCount, setClickCount] = useState(0);

  const handleStudyCrypto = () => {
    dispatch({ 
      type: "INCREMENT_RESOURCE", 
      payload: { 
        resourceId: "knowledge", 
        amount: 1 
      } 
    });
    
    console.log("Изучение крипты: +1 знание");
    
    setClickCount(prev => prev + 1);
    
    // После 3 нажатий разблокируем кнопку "Применить знания"
    if (clickCount === 2) {
      console.log("Разблокировка применения знаний из-за достижения 3 кликов");
      dispatch({ type: "UNLOCK_FEATURE", payload: { featureId: "applyKnowledge" } });
      onAddEvent("Вы начинаете понимать основы криптовалют! Скоро вы сможете применить свои знания.", "info");
    }
  };
  
  const handleApplyKnowledge = () => {
    const resource = state.resources.knowledge;
    if (resource.value >= 10) {
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: -10 } });
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "usdt", amount: 1 } });
      
      // Разблокируем USDT после первого использования "Применить знания"
      if (!state.resources.usdt.unlocked) {
        dispatch({ type: "UNLOCK_RESOURCE", payload: { resourceId: "usdt" } });
        onAddEvent("Вы получили первый USDT!", "success");
      }
      
      // Счетчик применений знаний для разблокировки Практики
      dispatch({ type: "INCREMENT_COUNTER", payload: { counterId: "applyKnowledge" } });
      
      // Разблокируем кнопку "Практика" после второго применения знаний
      if (state.counters?.applyKnowledge === 1) {  // Значит это второе применение
        dispatch({ 
          type: "SET_BUILDING_UNLOCKED", 
          payload: { buildingId: "practice", unlocked: true } 
        });
        onAddEvent("После применения знаний открыта функция 'Практика'!", "success");
        onAddEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      }
    } else {
      onAddEvent("Не удалось применить знания - нужно больше изучать (минимум 10 знаний)", "error");
    }
  };
  
  const handleActivatePractice = () => {
    console.log("Активация практики. USDT:", state.resources.usdt.value, "Здание уже построено:", state.buildings.practice.count > 0);
    
    if (state.resources.usdt.value >= 10) {
      dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
      
      if (state.buildings.practice.count === 0) { // Первая активация
        onAddEvent("Вы запустили фоновое накопление знаний! Теперь знания будут накапливаться автоматически.", "success");
        onAddEvent("Чтобы увеличить скорость накопления знаний, используйте Практику, а также изучайте различные исследования.", "info");
      }
    } else {
      onAddEvent("Не удалось начать практику - не хватает USDT", "error");
    }
  };
  
  const handleMining = () => {
    if (state.resources.computingPower.value >= 50) {
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "computingPower", amount: -50 } });
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "usdt", amount: 1 } });
      
      // Разблокируем автомайнер после первого использования майнинга
      if (!state.buildings.autoMiner.unlocked) {
        dispatch({ type: "SET_BUILDING_UNLOCKED", payload: { buildingId: "autoMiner", unlocked: true } });
        onAddEvent("Открыто новое оборудование: Автомайнер!", "success");
        onAddEvent("Автомайнер позволяет автоматически обменивать вычислительную мощность на USDT", "info");
      }
    } else {
      onAddEvent("Недостаточно вычислительной мощности для майнинга", "error");
    }
  };

  const shouldShowApplyKnowledge = state.unlocks.applyKnowledge;
  const shouldShowPractice = state.buildings.practice.unlocked;
  const shouldShowMining = state.resources.computingPower.unlocked && state.buildings.autoMiner.count === 0;
  
  const actualPracticeCost = state.buildings.practice.cost.usdt * 
    Math.pow(state.buildings.practice.costMultiplier, state.buildings.practice.count);
  const canAffordPractice = state.resources.usdt.value >= actualPracticeCost;

  return (
    <div className="bg-white rounded-lg p-3 space-y-3">
      <div className="flex flex-col space-y-2">
        <Button
          className="action-button w-full"
          onClick={handleStudyCrypto}
        >
          Изучить крипту
        </Button>
        
        {shouldShowApplyKnowledge && (
          <Button
            className="action-button w-full"
            variant="secondary"
            onClick={handleApplyKnowledge}
            disabled={state.resources.knowledge.value < 10}
          >
            Применить знания
          </Button>
        )}
        
        {shouldShowPractice && (
          <Button
            className="action-button w-full"
            variant="outline"
            onClick={handleActivatePractice}
            disabled={!canAffordPractice}
          >
            Практика
          </Button>
        )}
        
        {shouldShowMining && (
          <Button
            className="action-button w-full"
            variant="outline"
            onClick={handleMining}
            disabled={state.resources.computingPower.value < 50}
          >
            Майнинг
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
