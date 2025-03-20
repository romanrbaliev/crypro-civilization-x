
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Brain, Coins } from "lucide-react";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";
import PracticeButton from "./buttons/PracticeButton";
import { useActionButtons } from "@/hooks/useActionButtons";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const {
    handleLearnClick,
    handleApplyKnowledge,
    handlePractice,
    handleExchangeBtc,
    isButtonEnabled,
    practiceIsUnlocked,
    practiceBuildingExists,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate
  } = useActionButtons({ onAddEvent });
  
  const hasApplyKnowledge = state.unlocks.applyKnowledge;
  
  // Получаем значения ресурсов для проверки доступности кнопок
  const { knowledge, usdt, btc } = state.resources;
  
  // Проверка на возможность обмена BTC
  const canExchangeBtc = 
    btc.unlocked && 
    btc.value > 0 && 
    usdt.value + (btc.value * currentExchangeRate) <= usdt.max;
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleLearnClick}
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
      
      {practiceBuildingExists && practiceIsUnlocked && (
        <PracticeButton
          onClick={handlePractice}
          disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
          level={practiceCurrentLevel}
          cost={practiceCurrentCost}
        />
      )}
      
      {btc.unlocked && (
        <ExchangeBtcButton 
          onClick={handleExchangeBtc}
          disabled={!canExchangeBtc}
          className="flex-1"
          currentRate={currentExchangeRate}
        />
      )}
    </div>
  );
};

export default ActionButtons;
