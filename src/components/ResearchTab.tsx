
import React, { useState, useEffect } from "react";
import { Lightbulb, Dna, Puzzle } from "lucide-react";
import UpgradeItem from "@/components/UpgradeItem";
import { useGame } from "@/context/hooks/useGame";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import TechTree from "@/components/TechTree";
import SynergyTab from "@/components/SynergyTab";

const ResearchTab: React.FC = () => {
  const { state } = useGame();
  const [currentTab, setCurrentTab] = useState("tree");
  
  // Функция для отправки событий через глобальную шину событий
  const addEvent = (message: string, type: string = "info") => {
    if (window.gameEventBus) {
      window.gameEventBus.dispatchEvent(
        new CustomEvent('game-event', { detail: { message, type } })
      );
    }
  };
  
  // Фильтруем исследования без категории (старые исследования)
  const unlockedUpgrades = Object.values(state.upgrades)
    .filter(u => u.unlocked && !u.purchased && !u.category);
    
  const purchasedUpgrades = Object.values(state.upgrades)
    .filter(u => u.purchased && !u.category);
  
  // Получаем количество новых доступных исследований с категориями
  const unlockedCategoryUpgrades = Object.values(state.upgrades)
    .filter(u => u.unlocked && !u.purchased && u.category);
  
  // Подсчет доступных исследований по категориям
  const getUnlockedCountByCategory = () => {
    const counts: {[key: string]: number} = {};
    
    unlockedCategoryUpgrades.forEach(u => {
      if (!counts[u.category!]) {
        counts[u.category!] = 0;
      }
      counts[u.category!]++;
    });
    
    return counts;
  };
  
  const unlockedCounts = getUnlockedCountByCategory();
  
  // Получаем количество разблокированных, но не активированных синергий
  const availableSynergies = Object.values(state.specializationSynergies || {})
    .filter(s => s.unlocked && !s.active).length;
  
  // Эффект для автоматического переключения на дерево технологий, если там есть новые исследования
  useEffect(() => {
    if (unlockedCategoryUpgrades.length > 0 && unlockedUpgrades.length === 0) {
      setCurrentTab("tree");
    }
  }, [unlockedCategoryUpgrades.length, unlockedUpgrades.length]);

  return (
    <Tabs defaultValue="tree" value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mb-2">
        <TabsTrigger value="tree" className="text-xs h-7 relative">
          <Dna className="h-3 w-3 mr-1" />
          Древо технологий
          {unlockedCategoryUpgrades.length > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full text-[8px] min-w-[14px] h-[14px] flex items-center justify-center">
              {unlockedCategoryUpgrades.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="list" className="text-xs h-7 relative">
          <Lightbulb className="h-3 w-3 mr-1" />
          Список
          {unlockedUpgrades.length > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full text-[8px] min-w-[14px] h-[14px] flex items-center justify-center">
              {unlockedUpgrades.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="synergy" className="text-xs h-7 relative">
          <Puzzle className="h-3 w-3 mr-1" />
          Синергия
          {availableSynergies > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white rounded-full text-[8px] min-w-[14px] h-[14px] flex items-center justify-center">
              {availableSynergies}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tree" className="flex-1 overflow-auto mt-0">
        <TechTree onAddEvent={addEvent} />
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
                    onPurchase={() => addEvent(`Завершено исследование: ${upgrade.name}`, "success")} 
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
              {unlockedCategoryUpgrades.length > 0 && (
                <p className="text-xs mt-2 text-blue-500">
                  У вас есть доступные исследования в разделе "Древо технологий"
                </p>
              )}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="synergy" className="flex-1 overflow-auto mt-0">
        <SynergyTab onAddEvent={addEvent} />
      </TabsContent>
    </Tabs>
  );
};

export default ResearchTab;
