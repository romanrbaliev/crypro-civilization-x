
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { formatNumberWithAbbreviation, numberWithCommas } from "@/utils/formatters";
import { calculateResourceMaxValue } from "@/utils/resourceCalculator";
import { Button } from "@/components/ui/button";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Используем новую систему разблокировок
  const isApplyKnowledgeUnlocked = true; // Это действие всегда разблокировано
  const isApplyAllKnowledgeUnlocked = true; // Доступно с самого начала
  const isExchangeBtcUnlocked = useUnlockStatus('exchangeBtc');
  
  const knowledge = state.resources.knowledge?.value || 0;
  const knowledgeMax = calculateResourceMaxValue(state, 'knowledge');
  const bitcoin = state.resources.bitcoin?.value || 0;
  const usdt = state.resources.usdt?.value || 0;
  const usdtMax = calculateResourceMaxValue(state, 'usdt');
  const canApplyKnowledge = knowledge >= 10;
  
  const handleStudyClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    // Увеличиваем счетчик кликов
    dispatch({ 
      type: "INCREMENT_COUNTER", 
      payload: { counterId: "knowledgeClicks", value: 1 } 
    });
    
    // Проверяем разблокировки после клика
    dispatch({ type: "FORCE_CHECK_UNLOCKS" });
  };
  
  const handleApplyKnowledge = () => {
    if (canApplyKnowledge) {
      dispatch({ type: "APPLY_KNOWLEDGE" });
      
      // Увеличиваем счетчик применений знаний
      dispatch({ 
        type: "INCREMENT_COUNTER", 
        payload: { counterId: "applyKnowledge", value: 1 } 
      });
      
      onAddEvent(`Знания применены! Получено USDT`, "success");
      
      // Проверяем разблокировки после применения знаний
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  };
  
  const handleApplyAllKnowledge = () => {
    if (canApplyKnowledge) {
      dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
      
      // Увеличиваем счетчик применений знаний (но только на 1, так как это единичное действие)
      dispatch({ 
        type: "INCREMENT_COUNTER", 
        payload: { counterId: "applyKnowledge", value: 1 } 
      });
      
      onAddEvent(`Все знания применены! Получено USDT`, "success");
      
      // Проверяем разблокировки после применения знаний
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  };
  
  const handleExchangeBTC = () => {
    if (bitcoin > 0) {
      dispatch({ type: "EXCHANGE_BTC" });
      onAddEvent(`BTC обменяны на USDT по текущему курсу`, "success");
      
      // Проверяем разблокировки после обмена
      dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    }
  };
  
  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
          onClick={handleStudyClick}
        >
          Изучить крипту <span className="ml-1 text-xs">
            ({formatNumberWithAbbreviation(knowledge)}/{formatNumberWithAbbreviation(knowledgeMax)})
          </span>
        </Button>
        
        {isApplyKnowledgeUnlocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700"
            onClick={handleApplyKnowledge}
            disabled={!canApplyKnowledge}
          >
            Применить знания <span className="ml-1 text-xs">
              (10 → 1 USDT)
            </span>
          </Button>
        )}
        
        {isApplyAllKnowledgeUnlocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
            onClick={handleApplyAllKnowledge}
            disabled={!canApplyKnowledge}
          >
            Применить все знания <span className="ml-1 text-xs">
              ({knowledge >= 10 ? Math.floor(knowledge / 10) * 10 : 0} → {knowledge >= 10 ? Math.floor(knowledge / 10) : 0} USDT)
            </span>
          </Button>
        )}
        
        {isExchangeBtcUnlocked && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700"
            onClick={handleExchangeBTC}
            disabled={bitcoin <= 0}
          >
            Обменять BTC <span className="ml-1 text-xs">
              ({bitcoin > 0 ? bitcoin.toFixed(8) : 0} BTC)
            </span>
          </Button>
        )}
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
