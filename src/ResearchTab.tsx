
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./components/UpgradeItem";
import TechTreeNode from "./components/TechTreeNode";
import { Beaker } from "lucide-react";
import { Upgrade } from "@/context/types";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  
  // Проверяем состояние флага research в unlocks
  const researchUnlocked = state.unlocks.research === true;
  
  // Определяем базовое исследование
  const isInitialResearch = (upgradeId: string) => {
    return upgradeId === 'basicBlockchain' || 
           upgradeId === 'blockchain_basics' || 
           upgradeId === 'blockchainBasics';
  };
  
  // Проверяем, куплены ли "Основы блокчейна" с явным приведением типов
  const basicBlockchainPurchased = Object.entries(state.upgrades)
    .some(([_, upgrade]) => 
      isInitialResearch(upgrade.id) && upgrade.purchased
    );
  
  // Фильтруем доступные исследования с явным приведением типов
  const unlockedUpgrades = Object.entries(state.upgrades)
    .filter(([_, upgrade]) => upgrade.unlocked && !upgrade.purchased)
    .map(([_, upgrade]) => upgrade as Upgrade);
  
  // Купленные исследования с явным приведением типов
  const purchasedUpgrades = Object.entries(state.upgrades)
    .filter(([_, upgrade]) => upgrade.purchased)
    .map(([_, upgrade]) => upgrade as Upgrade);
  
  // Если исследования не разблокированы, показываем пустой экран
  if (!researchUnlocked) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Beaker className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-xs">
          Исследования пока недоступны.<br />
          Продолжайте развиваться для открытия новых технологий.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Beaker className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-xs">
            Исследования пока недоступны.<br />
            Продолжайте развиваться для открытия новых технологий.
          </p>
        </div>
      ) : (
        <>
          {unlockedUpgrades.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-medium mb-2">Доступные исследования</h2>
              <div className="space-y-1">
                {unlockedUpgrades.map(upgrade => (
                  <TechTreeNode 
                    key={upgrade.id} 
                    upgrade={upgrade} 
                    onAddEvent={onAddEvent} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {purchasedUpgrades.length > 0 && (
            <div>
              <h2 className="text-sm font-medium mb-2">Завершенные исследования</h2>
              <div className="space-y-1">
                {purchasedUpgrades.map(upgrade => (
                  <TechTreeNode 
                    key={upgrade.id} 
                    upgrade={upgrade}
                    onAddEvent={onAddEvent}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResearchTab;
