
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";
import { useI18nContext } from "@/context/I18nContext";
import { gameIds, normalizeId } from "@/i18n";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { t } = useI18nContext();
  
  // Убедимся, что ID всегда определен с дефолтным значением
  const researchId = gameIds?.features?.research || 'research';
  
  // Добавляем диагностический консоль-лог для проверки researchId
  useEffect(() => {
    console.log("ResearchTab: ID исследований:", researchId);
  }, [researchId]);
  
  const researchUnlocked = useUnlockStatus(researchId);
  
  // Расширенные диагностические логи
  useEffect(() => {
    console.log("ResearchTab: research unlocked =", researchUnlocked);
    console.log("ResearchTab: total upgrades =", Object.keys(state.upgrades || {}).length);
    console.log("ResearchTab: upgrades keys =", Object.keys(state.upgrades || {}));
    
    // Проверяем наличие блокчейн-исследования
    const blockchainBasicsId = gameIds?.upgrades?.blockchainBasics || 'blockchainBasics';
    
    console.log("ResearchTab: Проверка blockchainBasics", 
      state.upgrades[blockchainBasicsId] ? 
      `exists, unlocked=${state.upgrades[blockchainBasicsId].unlocked}` : 
      "not exists");
    
    // Проверяем общее состояние системы разблокировок
    console.log("ResearchTab: Разблокировки (unlocks):", state.unlocks);
  }, [state.upgrades, researchUnlocked, state.unlocks]);
  
  // Безопасно получаем нормализованные исследования
  const getNormalizedUpgrades = () => {
    if (!state.upgrades) return {};
    
    // Создаем нормализованную копию исследований
    const normalizedUpgrades = { ...state.upgrades };
    
    // Проверяем наличие исследования Основы блокчейна
    const blockchainBasicsId = gameIds?.upgrades?.blockchainBasics || 'blockchainBasics';
    
    // Проверяем все возможные устаревшие ID для совместимости
    const possibleBlockchainBasicsIds = [
      blockchainBasicsId, 
      'blockchain_basics', 
      'basicBlockchain'
    ];
    
    for (const id of possibleBlockchainBasicsIds) {
      if (normalizedUpgrades[id] && normalizedUpgrades[id].unlocked) {
        console.log(`ResearchTab: Найдено исследование Основы блокчейна с ID ${id}`);
        
        // Нормализуем ID в стандартный формат
        if (id !== blockchainBasicsId) {
          normalizedUpgrades[blockchainBasicsId] = {
            ...normalizedUpgrades[id],
            id: blockchainBasicsId
          };
        }
      }
    }
    
    return normalizedUpgrades;
  };
  
  // Получаем нормализованные исследования
  const normalizedUpgrades = getNormalizedUpgrades();
  
  // Фильтруем разблокированные и приобретенные исследования с проверкой на undefined
  const unlockedUpgrades = Object.entries(normalizedUpgrades)
    .filter(([_, upgrade]) => upgrade && upgrade.unlocked && !upgrade.purchased)
    .map(([_, upgrade]) => upgrade);
  
  const purchasedUpgrades = Object.entries(normalizedUpgrades)
    .filter(([_, upgrade]) => upgrade && upgrade.purchased)
    .map(([_, upgrade]) => upgrade);
  
  // Проверка, есть ли разблокированные исследования
  useEffect(() => {
    if (researchUnlocked && unlockedUpgrades.length === 0) {
      console.log("ResearchTab: Warning! Research tab is unlocked but no upgrades are available.");
      console.log("ResearchTab: Unlocks state:", state.unlocks);
      
      // Проверка, есть ли в state.upgrades исследования, но они не разблокированы
      const potentialUpgrades = Object.values(state.upgrades || {}).filter(u => u && !u.unlocked);
      console.log("ResearchTab: Potential upgrades (not unlocked):", potentialUpgrades.map(u => u.id));
      
      // Заставляем систему проверить все разблокировки
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  }, [researchUnlocked, unlockedUpgrades.length, state.unlocks, dispatch, state.upgrades]);
  
  // Если исследования не разблокированы, показываем пустой экран
  if (!researchUnlocked) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Beaker className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="text-xs">
          {t('research.researchUnavailable')}<br />
          {t('research.researchUnavailableDetail')}
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
            {t('research.noAvailableResearch')}<br />
            {t('research.noAvailableResearchDetail')}
          </p>
        </div>
      ) : (
        <>
          {unlockedUpgrades.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-medium mb-2">{t('research.availableResearch')}</h2>
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
              <h2 className="text-sm font-medium mb-2">{t('research.completedResearch')}</h2>
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
