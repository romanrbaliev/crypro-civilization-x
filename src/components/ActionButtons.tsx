
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";
import ResourceForecast from "@/components/ResourceForecast";

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
    
    setClickCount(prev => {
      const newCount = prev + 1;
      
      if (newCount === 3) {
        onAddEvent("Вы начинаете понимать основы криптовалют!", "info");
      } else if (newCount === 10) {
        onAddEvent("Продолжайте изучать, чтобы применить знания на практике", "info");
      }
      
      return newCount;
    });
  };
  
  const handleApplyKnowledge = () => {
    const resource = state.resources.knowledge;
    if (resource.value >= 10) {
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: -10 } });
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "usdt", amount: 1 } });
      
      onAddEvent("Вы конвертировали знания в USDT", "success");
    } else {
      toast.error("Недостаточно знаний! Нужно минимум 10.");
      onAddEvent("Не удалось применить знания - нужно больше изучать", "error");
    }
  };
  
  const handleActivatePractice = () => {
    console.log("Активация практики. USDT:", state.resources.usdt.value, "Здание уже построено:", state.buildings.practice.count > 0);
    
    if (state.resources.usdt.value >= 10) {
      dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
      
      onAddEvent("Вы начали практиковаться! Теперь знания накапливаются автоматически.", "success");
    } else {
      toast.error("Недостаточно USDT! Нужно минимум 10.");
      onAddEvent("Не удалось начать практику - не хватает USDT", "error");
    }
  };

  const shouldShowPractice = state.resources.usdt.unlocked;
  const actualPracticeCost = state.buildings.practice.cost.usdt * 
    Math.pow(state.buildings.practice.costMultiplier, state.buildings.practice.count);
  const canAffordPractice = state.resources.usdt.value >= actualPracticeCost;

  return (
    <div className="p-3 space-y-3 border-t bg-white">
      <div className="actions-container">
        <Button
          className="action-button w-full mb-2"
          onClick={handleStudyCrypto}
        >
          Изучить крипту
        </Button>
        
        {state.unlocks.applyKnowledge && (
          <Button
            className="action-button w-full mb-2"
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
      
      {state.unlocks.applyKnowledge && state.resources.knowledge.perSecond > 0 && (
        <ResourceForecast 
          resource={state.resources.knowledge} 
          targetValue={10} 
          label="До конвертации" 
        />
      )}
    </div>
  );
};

export default ActionButtons;
