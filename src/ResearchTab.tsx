
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./components/UpgradeItem";
import { Beaker } from "lucide-react";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Проверяем состояние флага research в unlocks
  const researchUnlocked = state.unlocks.research === true;
  
  // Определяем базовое исследование - возможны разные ID в разных системах
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
  
  // Фильтруем доступные исследования
  const unlockedUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.unlocked && !upgrade.purchased);
  
  // Купленные исследования
  const purchasedUpgrades = Object.values(state.upgrades)
    .filter(upgrade => upgrade.purchased);
  
  // Добавляем проверку и логирование для отладки
  useEffect(() => {
    console.log("ResearchTab: Вкладка исследований разблокирована:", researchUnlocked);
    console.log("ResearchTab: Доступные исследования:", unlockedUpgrades.map(u => u.id));
    console.log("ResearchTab: Купленные исследования:", purchasedUpgrades.map(u => u.id));
    
    // Проверяем все исследования в state
    const allResearchIds = Object.keys(state.upgrades);
    console.log("ResearchTab: Все исследования в state:", allResearchIds);
    
    // Проверяем конкретно "Основы блокчейна"
    const blockchainBasicsUpgrades = Object.values(state.upgrades)
      .filter(upgrade => isInitialResearch(upgrade.id));
    
    console.log("ResearchTab: Исследования 'Основы блокчейна':", 
      blockchainBasicsUpgrades.map(u => 
        `${u.id} (unlocked=${u.unlocked}, purchased=${u.purchased})`
      )
    );
    
    // Если исследований нет, но вкладка разблокирована, выполняем проверку разблокировок
    if (researchUnlocked && unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0) {
      console.log("ResearchTab: Нет исследований, хотя вкладка разблокирована. Принудительная проверка разблокировок...");
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  }, [state.upgrades, state.unlocks.research, dispatch]);
  
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
          <button 
            onClick={() => dispatch({ type: "FORCE_CHECK_UNLOCKS" })}
            className="mt-3 text-xs text-blue-500 underline"
          >
            Проверить доступные исследования
          </button>
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
