
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
    
    // Используем useEffect вместо обновления state внутри обработчика событий
    // чтобы избежать предупреждения React о setState в рендере
    if (clickCount === 2) {
      onAddEvent("Вы начинаете понимать основы криптовалют!", "info");
    } else if (clickCount === 9) {
      onAddEvent("Продолжайте изучать, чтобы применить знания на практике", "info");
    }
    
    setClickCount(prev => prev + 1);
  };
  
  const handleApplyKnowledge = () => {
    const resource = state.resources.knowledge;
    if (resource.value >= 10) {
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: -10 } });
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "usdt", amount: 1 } });
      
      // Разблокируем здание "practice" после первого использования "Применить знания"
      if (!state.buildings.practice.unlocked) {
        dispatch({ 
          type: "SET_BUILDING_UNLOCKED", 
          payload: { buildingId: "practice", unlocked: true } 
        });
        onAddEvent("Вы получили первый USDT! Теперь доступна функция 'Практика'.", "success");
        onAddEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      }
    } else {
      onAddEvent("Не удалось применить знания - нужно больше изучать", "error");
    }
  };
  
  const handleActivatePractice = () => {
    console.log("Активация практики. USDT:", state.resources.usdt.value, "Здание уже построено:", state.buildings.practice.count > 0);
    
    if (state.resources.usdt.value >= 10) {
      dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
    } else {
      onAddEvent("Не удалось начать практику - не хватает USDT", "error");
    }
  };

  const shouldShowPractice = state.buildings.practice.unlocked;
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
        
        {state.unlocks.applyKnowledge && (
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
      </div>
    </div>
  );
};

export default ActionButtons;
