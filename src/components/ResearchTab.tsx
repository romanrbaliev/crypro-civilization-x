
import React, { useState } from "react";
import { Lightbulb, Dna } from "lucide-react";
import UpgradeItem from "@/components/UpgradeItem";
import { useGame } from "@/context/hooks/useGame";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import TechTree from "@/components/TechTree";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const [currentTab, setCurrentTab] = useState("tree");
  
  const unlockedUpgrades = Object.values(state.upgrades)
    .filter(u => u.unlocked && !u.purchased && !u.category); // Фильтруем только старые исследования без категории
    
  const purchasedUpgrades = Object.values(state.upgrades)
    .filter(u => u.purchased && !u.category); // Фильтруем только старые исследования без категории

  return (
    <Tabs defaultValue="tree" value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
      <TabsList className="grid grid-cols-2 mb-2">
        <TabsTrigger value="tree" className="text-xs h-7">
          <Dna className="h-3 w-3 mr-1" />
          Древо технологий
        </TabsTrigger>
        <TabsTrigger value="list" className="text-xs h-7">
          <Lightbulb className="h-3 w-3 mr-1" />
          Список
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tree" className="flex-1 overflow-auto mt-0">
        <TechTree onAddEvent={onAddEvent} />
      </TabsContent>
      
      <TabsContent value="list" className="flex-1 overflow-auto mt-0">
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
      </TabsContent>
    </Tabs>
  );
};

export default ResearchTab;
