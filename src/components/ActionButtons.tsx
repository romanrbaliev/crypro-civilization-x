
import React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";
import { DollarSign, Brain, Coins, BadgeDollarSign, Bitcoin } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  // Безопасное получение значения ресурса
  const getResourceValue = (id: string) => {
    return state.resources[id]?.value || 0;
  };
  
  // Обработчики действий
  const handleLearnAction = () => {
    dispatch({ type: "LEARN_ACTION" });
  };
  
  const handleApplyKnowledge = () => {
    if (getResourceValue('knowledge') < 10) {
      onAddEvent('Недостаточно знаний для применения', 'warning');
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
    onAddEvent('Знания успешно применены', 'success');
  };
  
  const handlePurchasePractice = () => {
    if (getResourceValue('usdt') < 5) {
      onAddEvent('Недостаточно USDT для покупки практики', 'warning');
      return;
    }
    
    dispatch({ type: "PURCHASE_PRACTICE" });
    onAddEvent('Практика успешно приобретена', 'success');
  };
  
  const handleExchangeBtc = () => {
    const bitcoinValue = getResourceValue('bitcoin');
    if (bitcoinValue <= 0) {
      onAddEvent('У вас нет Bitcoin для обмена', 'warning');
      return;
    }
    
    const price = state.btcPrice || 20000;
    const usdtToGet = bitcoinValue * price;
    
    dispatch({ type: "EXCHANGE_BTC" });
    onAddEvent(`${bitcoinValue} BTC обменяно на ${usdtToGet.toFixed(2)} USDT`, 'success');
  };
  
  // Проверка доступности действий
  const canApplyKnowledge = (
    state.unlocks.applyKnowledge === true && 
    getResourceValue('knowledge') >= 10
  );
  
  const canPurchasePractice = (
    state.unlocks.practice === true && 
    getResourceValue('usdt') >= 5
  );
  
  const canExchangeBtc = (
    state.unlocks.bitcoin === true && 
    getResourceValue('bitcoin') > 0
  );
  
  return (
    <div className="bg-white border rounded-lg p-3 mt-4">
      <h2 className="text-sm font-medium mb-2">Действия</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Кнопка "Изучить крипту" всегда доступна */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLearnAction}
                className="w-full flex items-center"
              >
                <Brain className="h-4 w-4 mr-2" />
                <span className="text-xs">Изучить крипту</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Получить +1 знание о криптовалютах</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Кнопка "Применить знания" - разблокируется по прогрессу */}
        {state.unlocks.applyKnowledge && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleApplyKnowledge}
                  disabled={!canApplyKnowledge}
                  className="w-full flex items-center"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  <span className="text-xs">Применить знания</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Обменять 10 знаний на USDT</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Кнопка "Обменять Bitcoin" - видна только когда разблокирован Bitcoin */}
        {state.unlocks.bitcoin && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExchangeBtc}
                  disabled={!canExchangeBtc}
                  className="w-full flex items-center"
                >
                  <Bitcoin className="h-4 w-4 mr-2" />
                  <span className="text-xs">Обменять Bitcoin</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Обменять имеющийся Bitcoin на USDT по текущему курсу</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
