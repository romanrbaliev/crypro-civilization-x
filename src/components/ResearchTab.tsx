
import React from "react";
import { Lightbulb } from "lucide-react";
import UpgradeItem from "@/components/UpgradeItem";
import ResourceForecast from "@/components/ResourceForecast";
import { Resource, Upgrade, useGame } from "@/context/GameContext";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  
  const unlockedUpgrades = Object.values(state.upgrades).filter(u => u.unlocked && !u.purchased);
  const purchasedUpgrades = Object.values(state.upgrades).filter(u => u.purchased);

  return (
    <div className="space-y-3">
      {unlockedUpgrades.length > 0 ? (
        <div>
          <div className="space-y-2 building-content">
            {unlockedUpgrades.map(upgrade => (
              <UpgradeItem 
                key={upgrade.id} 
                upgrade={upgrade} 
                onPurchase={() => onAddEvent(`Завершено исследование: ${upgrade.name}`, "success")} 
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyResearchState 
          knowledge={state.resources.knowledge}
          knowledgePerSecond={state.resources.knowledge.perSecond}
        />
      )}
      
      {purchasedUpgrades.length > 0 && (
        <div className="mt-3">
          <h3 className="font-medium text-[9px] mb-2">Завершенные исследования</h3>
          <div className="space-y-2 building-content">
            {purchasedUpgrades.map(upgrade => (
              <UpgradeItem key={upgrade.id} upgrade={upgrade} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyResearchState = ({ knowledge, knowledgePerSecond }: { knowledge: Resource, knowledgePerSecond: number }) => {
  return (
    <div className="text-center py-6 text-gray-500">
      <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="text-xs">У вас пока нет доступных исследований.<br />Продолжайте набирать знания и ресурсы.</p>
      
      {knowledge.value < 45 && knowledgePerSecond > 0 && (
        <div className="mt-3">
          <ResourceForecast 
            resource={knowledge} 
            targetValue={45} 
            label="До открытия исследования «Основы блокчейна»" 
          />
        </div>
      )}
    </div>
  );
};

export default ResearchTab;
