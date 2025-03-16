
import React from "react";
import { Lightbulb } from "lucide-react";
import UpgradeItem from "@/components/UpgradeItem";
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
      {unlockedUpgrades.length > 0 && (
        <div>
          <h3 className="font-medium text-[9px] mb-2">Доступные исследования</h3>
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
      
      {unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-xs">Продолжайте накапливать знания для открытия исследований.</p>
        </div>
      )}
    </div>
  );
};

export default ResearchTab;
