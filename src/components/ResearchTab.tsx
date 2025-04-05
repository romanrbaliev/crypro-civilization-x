
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import UpgradeItem from "./UpgradeItem";
import { Beaker } from "lucide-react";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";
import { useI18nContext } from "@/context/I18nContext";
import { gameIds } from "@/i18n";

interface ResearchTabProps {
  onAddEvent: (message: string, type: string) => void;
}

const ResearchTab: React.FC<ResearchTabProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { t } = useI18nContext();
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем константу вместо undefined
  const DEFAULT_RESEARCH_ID = 'research';
  
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем наличие gameIds и устанавливаем дефолтное значение
  const researchId = gameIds?.features?.research || DEFAULT_RESEARCH_ID;
  
  // ИСПРАВЛЕНИЕ: Логируем используемый ID
  useEffect(() => {
    console.log("ResearchTab: Используется ID для проверки разблокировки исследований:", researchId);
    
    // Проверяем наличие gameIds для отладки
    if (!gameIds || !gameIds.features) {
      console.warn("ResearchTab: gameIds или gameIds.features не определены!");
    }
  }, [researchId]);
  
  // ИСПРАВЛЕНИЕ: Используем researchId, который теперь гарантированно является строкой
  const researchUnlocked = useUnlockStatus(researchId);
  
  // ИСПРАВЛЕНИЕ: Усиленное логгирование для отладки
  useEffect(() => {
    console.log("ResearchTab: Состояние разблокировки исследований =", researchUnlocked);
    console.log("ResearchTab: Общее количество улучшений =", Object.keys(state.upgrades || {}).length);
    
    if (researchUnlocked && Object.keys(state.upgrades || {}).length === 0) {
      console.log("ResearchTab: Предупреждение! Вкладка исследований разблокирована, но улучшения отсутствуют.");
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  }, [researchUnlocked, state.upgrades, dispatch]);
  
  // Безопасно получаем нормализованные исследования
  const getNormalizedUpgrades = () => {
    if (!state.upgrades) return {};
    
    // Создаем нормализованную копию исследований
    const normalizedUpgrades = { ...state.upgrades };
    
    // ИСПРАВЛЕНИЕ: Используем гарантированно строковый ID
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
