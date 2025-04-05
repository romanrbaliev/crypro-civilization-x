
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Используем новую систему разблокировок
  const researchUnlocked = useUnlockStatus('research');
  
  // Диагностические логи для отслеживания проблемы
  useEffect(() => {
    console.log("ResearchTab: research unlocked =", researchUnlocked);
    console.log("ResearchTab: total upgrades =", Object.keys(state.upgrades || {}).length);
    console.log("ResearchTab: upgrades keys =", Object.keys(state.upgrades || {}));
    
    // Проверяем наличие базовых исследований
    const blockchainBasicsIds = ['blockchainBasics', 'blockchain_basics', 'basicBlockchain'];
    for (const id of blockchainBasicsIds) {
      if (state.upgrades && state.upgrades[id]) {
        console.log(`ResearchTab: ${id} exists = true, unlocked =`, state.upgrades[id].unlocked);
      } else {
        console.log(`ResearchTab: ${id} exists = false`);
      }
    }
  }, [state.upgrades, researchUnlocked]);
  
  // Безопасно фильтруем исследования с явной проверкой на null/undefined
  const unlockedUpgrades = Object.entries(state.upgrades || {})
    .filter(([_, upgrade]) => upgrade && upgrade.unlocked && !upgrade.purchased)
    .map(([_, upgrade]) => upgrade);
  
  const purchasedUpgrades = Object.entries(state.upgrades || {})
    .filter(([_, upgrade]) => upgrade && upgrade.purchased)
    .map(([_, upgrade]) => upgrade);
  
  // Проверка, есть ли разблокированные исследования, если нет - запускаем проверку
  useEffect(() => {
    if (researchUnlocked && unlockedUpgrades.length === 0) {
      console.log("ResearchTab: Warning! Research tab is unlocked but no upgrades are available.");
      console.log("ResearchTab: Unlocks state:", state.unlocks);
      
      // Проверка, есть ли в state.upgrades исследования, но они не разблокированы
      const potentialUpgrades = Object.values(state.upgrades || {}).filter(u => u && !u.unlocked);
      console.log("ResearchTab: Potential upgrades (not unlocked):", potentialUpgrades.map(u => u.id));
      
      // Если вкладка исследований разблокирована, но нет видимых исследований,
      // заставляем систему проверить все разблокировки
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  }, [researchUnlocked, unlockedUpgrades.length, state.unlocks, dispatch, state.upgrades]);
  
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
