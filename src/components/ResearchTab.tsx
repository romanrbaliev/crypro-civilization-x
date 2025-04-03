
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";
import { UnlockManagerService } from "@/services/UnlockManagerService";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Проверяем состояние флага research в unlocks
  const researchUnlocked = state.unlocks.research === true;
  
  // Определяем базовое исследование
  const isInitialResearch = (upgradeId: string) => {
    return upgradeId === 'basicBlockchain' || 
           upgradeId === 'blockchain_basics' || 
           upgradeId === 'blockchainBasics';
  };
  
  // Проверяем, куплены ли "Основы блокчейна"
  const basicBlockchainPurchased = Object.values(state.upgrades)
    .some(upgrade => 
      isInitialResearch(upgrade.id) && upgrade.purchased
    );
  
  // При монтировании компонента проверим разблокировку исследований
  useEffect(() => {
    console.log("ResearchTab: Проверка разблокировки исследований");
    console.log("ResearchTab: Текущий статус разблокировки:", researchUnlocked);
    console.log("ResearchTab: Количество генераторов:", state.buildings.generator?.count || 0);
    
    // Если есть генератор, но исследования не разблокированы, проверяем разблокировки
    if (state.buildings.generator?.count > 0 && !researchUnlocked) {
      console.log("ResearchTab: Есть генератор, но исследования не разблокированы. Запрашиваем обновление.");
      dispatch({ type: "FORCE_RESOURCE_UPDATE" });
    }
  }, [researchUnlocked, state.buildings.generator?.count, dispatch]);
  
  // Фильтруем доступные исследования
  const unlockedUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.unlocked && !upgrade.purchased);
  
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
                  <UpgradeItem 
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
