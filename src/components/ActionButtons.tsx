
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Brain, Coins, ArrowRightLeft } from "lucide-react";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  const hasApplyKnowledge = state.unlocks.applyKnowledge;
  
  const handleLearn = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 }});
    
    // Увеличиваем счетчик нажатий для разблокировки кнопки "Применить знания"
    if (!hasApplyKnowledge) {
      dispatch({ type: "INCREMENT_COUNTER", payload: { counterId: "applyKnowledge", value: 1 }});
    }
  };
  
  const handleApplyKnowledge = () => {
    dispatch({ type: "APPLY_KNOWLEDGE" });
    onAddEvent("Знания применены! Получено 1 USDT", "success");
  };
  
  const handleExchangeBtc = () => {
    dispatch({ type: "EXCHANGE_BTC" });
    onAddEvent("Bitcoin продан за USDT", "success");
  };
  
  // Получаем значения ресурсов для проверки доступности кнопок
  const { knowledge, usdt, btc } = state.resources;
  
  // Проверка на возможность обмена BTC
  const canExchangeBtc = 
    btc.unlocked && 
    btc.value > 0 && 
    usdt.value + (btc.value * state.miningParams.exchangeRate) <= usdt.max;
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleLearn}
        className="flex-1"
        size="sm"
      >
        <Brain className="mr-2 h-4 w-4" />
        Изучить крипту
      </Button>
      
      {hasApplyKnowledge && (
        <Button
          onClick={handleApplyKnowledge}
          className="flex-1"
          size="sm"
          disabled={knowledge.value < 10}
          variant={knowledge.value < 10 ? "outline" : "default"}
        >
          <Coins className="mr-2 h-4 w-4" />
          Применить знания
        </Button>
      )}
      
      {btc.unlocked && (
        <ExchangeBtcButton 
          onClick={handleExchangeBtc}
          disabled={!canExchangeBtc}
          className="flex-1"
        />
      )}
    </div>
  );
};

export default ActionButtons;
