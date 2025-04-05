
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { formatNumberWithAbbreviation, numberWithCommas } from "@/utils/formatters";
import { calculateResourceMaxValue } from "@/utils/resourceCalculator";
import { Button } from "@/components/ui/button";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";
import { useI18nContext } from "@/context/I18nContext";
import { gameIds } from "@/i18n";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { t } = useI18nContext();
  
  // Используем новую систему разблокировок с унифицированными ID
  const isApplyAllKnowledgeUnlocked = true; // Доступно с самого начала
  const isExchangeBtcUnlocked = useUnlockStatus(gameIds.features.exchangeBtc);
  
  const knowledge = state.resources.knowledge?.value || 0;
  const knowledgeMax = calculateResourceMaxValue(state, gameIds.resources.knowledge);
  const bitcoin = state.resources.bitcoin?.value || 0;
  const usdt = state.resources.usdt?.value || 0;
  const usdtMax = calculateResourceMaxValue(state, gameIds.resources.usdt);
  const canApplyKnowledge = knowledge >= 10;
  
  const handleStudyClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: gameIds.resources.knowledge, amount: 1 } });
    
    // Увеличиваем счетчик кликов
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "knowledgeClicks", value: 1 } 
    });
    
    // Проверяем разблокировки после клика
    dispatch({ type: "FORCE_CHECK_UNLOCKS" });
  };
  
  const handleApplyAllKnowledge = () => {
    if (canApplyKnowledge) {
      // Увеличиваем счетчик применений знаний ровно на 1
      dispatch({ 
        type: "INCREMENT_COUNTER", 
        payload: { counterId: gameIds.actions.applyKnowledge, value: 1 } 
      });
      
      // Применяем знания
      dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
      
      console.log("handleApplyAllKnowledge: Увеличение счетчика applyKnowledge на 1");
      
      onAddEvent(t('events.knowledgeApplied') as string, "success");
      
      // Проверяем разблокировки после применения знаний
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  };
  
  const handleExchangeBTC = () => {
    if (bitcoin > 0) {
      dispatch({ type: "EXCHANGE_BTC" });
      onAddEvent(t('events.btcExchanged') as string, "success");
      
      // Проверяем разблокировки после обмена
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  };
  
  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex flex-col gap-2">
        {/* Кнопки отображаются снизу вверх в порядке разблокировки */}
        {isExchangeBtcUnlocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-gray-200 ${bitcoin <= 0 ? 'text-gray-400' : 'text-gray-900'}`}
            onClick={handleExchangeBTC}
            disabled={bitcoin <= 0}
          >
            {t('actions.exchangeBTC')}
          </Button>
        )}
        
        {isApplyAllKnowledgeUnlocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`border-gray-200 ${!canApplyKnowledge ? 'text-gray-400' : 'text-gray-900'}`}
            onClick={handleApplyAllKnowledge}
            disabled={!canApplyKnowledge}
          >
            {t('actions.applyKnowledge')}
          </Button>
        )}
        
        {/* Кнопка изучения криптовалюты всегда внизу */}
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-200 text-gray-900"
          onClick={handleStudyClick}
        >
          {t('actions.learnCrypto')}
        </Button>
      </div>
      
      <div className="mt-1 text-xs text-gray-500 flex justify-between">
        <span>
          USDT: {numberWithCommas(usdt.toFixed(2))}/{numberWithCommas(usdtMax.toFixed(2))}
        </span>
        {bitcoin > 0 && (
          <span>
            BTC: {bitcoin.toFixed(8)} | Курс: ${state.btcPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
