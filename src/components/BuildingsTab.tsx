
import React from "react";
import { Building as BuildingIcon } from "lucide-react";
import BuildingItem from "@/components/BuildingItem";
import ResourceForecast from "@/components/ResourceForecast";
import { Building, Resource, useGame } from "@/context/GameContext";

interface BuildingsTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const BuildingsTab: React.FC<BuildingsTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();

  const unlockedBuildings = Object.values(state.buildings)
    .filter(b => b.unlocked && b.id !== "practice");

  return (
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
