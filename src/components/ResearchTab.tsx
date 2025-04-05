
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
  
  // ИСПРАВЛЕНО: Убедимся, что ID всегда определен
  const researchId = gameIds?.features?.research || 'research';
  const researchUnlocked = useUnlockStatus(researchId);
  
  // Расширенные диагностические логи для отслеживания проблемы
  useEffect(() => {
    console.log("ResearchTab: research unlocked =", researchUnlocked);
    console.log("ResearchTab: total upgrades =", Object.keys(state.upgrades || {}).length);
    console.log("ResearchTab: upgrades keys =", Object.keys(state.upgrades || {}));
    
    // ИСПРАВЛЕНО: Добавляем проверку на undefined
    const blockchainBasicsId = gameIds?.upgrades?.blockchainBasics || 'blockchainBasics';
    
    // Проверяем наличие блокчейн-исследования
    console.log("ResearchTab: Проверка blockchainBasics", 
      state.upgrades[blockchainBasicsId] ? 
      `exists, unlocked=${state.upgrades[blockchainBasicsId].unlocked}` : 
      "not exists");
    
    // Проверяем общее состояние системы разблокировок
    console.log("ResearchTab: Разблокировки (unlocks):", state.unlocks);
  }, [state.upgrades, researchUnlocked, state.unlocks]);
  
  // Безопасно получаем нормализованные исследования, используя единую систему ID
  const getNormalizedUpgrades = () => {
    // Создаем нормализованную копию исследований
    const normalizedUpgrades = { ...state.upgrades };
    
    // Проверяем наличие исследования Основы блокчейна с новым стандартизированным ID
    const blockchainBasicsId = gameIds.upgrades.blockchainBasics;
    
    // Проверяем все возможные устаревшие ID для совместимости
    const possibleBlockchainBasicsIds = [
      blockchainBasicsId, 
      'blockchain_basics', 
      'basicBlockchain'
    ];
    
    let foundBlockchainBasics = false;
    
    for (const id of possibleBlockchainBasicsIds) {
      if (normalizedUpgrades[id] && normalizedUpgrades[id].unlocked) {
        foundBlockchainBasics = true;
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
  
  // Фильтруем разблокированные и приобретенные исследования
  const unlockedUpgrades = Object.entries(normalizedUpgrades)
    .filter(([_, upgrade]) => upgrade && upgrade.unlocked && !upgrade.purchased)
    .map(([_, upgrade]) => upgrade);
  
  const purchasedUpgrades = Object.entries(normalizedUpgrades)
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
