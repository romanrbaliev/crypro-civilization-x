
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ResourceForecast from "@/components/ResourceForecast";
import BuildingItem from "@/components/BuildingItem";
import { Building, Resource, useGame } from "@/context/GameContext";
import { toast } from "sonner";
import { Building as BuildingIcon } from "lucide-react";

interface BuildingsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const BuildingsTab: React.FC<BuildingsTabProps> = ({ onAddEvent }) => {
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

  const unlockedBuildings = Object.values(state.buildings)
    .filter(b => b.unlocked && b.id !== "practice");

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg p-3 space-y-3">
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
      
      <div className="building-container">
        {unlockedBuildings.length > 0 ? (
          <div className="space-y-2">
            {unlockedBuildings.map(building => (
              <BuildingItem 
                key={building.id} 
                building={building} 
                onPurchase={() => onAddEvent(`Построено здание: ${building.name}`, "success")} 
              />
            ))}
          </div>
        ) : (
          <EmptyBuildingsState 
            knowledge={state.resources.knowledge}
            knowledgePerSecond={state.resources.knowledge.perSecond}
          />
        )}
      </div>
    </div>
  );
};

const EmptyBuildingsState = ({ knowledge, knowledgePerSecond }: { knowledge: Resource, knowledgePerSecond: number }) => {
  return (
    <div className="text-center py-6 text-gray-500">
      <BuildingIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="text-xs">У вас пока нет доступных зданий.<br />Продолжайте набирать знания и ресурсы.</p>
      
      {knowledge.value < 15 && knowledgePerSecond > 0 && (
        <div className="mt-3">
          <ResourceForecast 
            resource={knowledge} 
            targetValue={15} 
            label="До открытия здания «Практика»" 
          />
        </div>
      )}
    </div>
  );
};

export default BuildingsTab;
