
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  
  // Проверяем состояние флага research в unlocks
  const researchUnlocked = state.unlocks.research === true;
  
  // Начальное исследование (только Основы блокчейна)
  const isInitialResearch = (upgradeId: string) => {
    return upgradeId === 'basicBlockchain' || 
           upgradeId === 'blockchain_basics' || 
           upgradeId === 'blockchainBasics';
  };
  
  // Фильтруем доступные исследования
  const unlockedUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.unlocked && !upgrade.purchased)
    // Только "Основы блокчейна" или другие исследования при наличии условий
    .filter(upgrade => {
      // Если Основы блокчейна, то показываем всегда
      if (isInitialResearch(upgrade.id)) return true;
      
      // Проверяем, куплены ли "Основы блокчейна"
      const basicBlockchainPurchased = 
        (state.upgrades.basicBlockchain && state.upgrades.basicBlockchain.purchased) ||
        (state.upgrades.blockchain_basics && state.upgrades.blockchain_basics.purchased) ||
        (state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.purchased);
        
      // Если "Основы блокчейна" куплены, проверяем дополнительные условия
      if (basicBlockchainPurchased) {
        // Для каждого исследования проверяем требования
        if (upgrade.requiredUpgrades && upgrade.requiredUpgrades.length > 0) {
          // Проверяем, что все требуемые исследования куплены
          return upgrade.requiredUpgrades.every(
            (reqId: string) => state.upgrades[reqId] && state.upgrades[reqId].purchased
          );
        }
        
        return true; // Возвращаем true для исследований без требований
      }
      
      return false; // Скрываем если "Основы блокчейна" не куплены
    });
  
  // Купленные исследования
  const purchasedUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.purchased);
  
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
            <div>
              <h2 className="text-sm font-medium mb-2">Завершенные исследования</h2>
              <div className="space-y-1">
                {purchasedUpgrades.map(upgrade => (
                  <UpgradeItem 
                    key={upgrade.id} 
                    upgrade={upgrade} 
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
