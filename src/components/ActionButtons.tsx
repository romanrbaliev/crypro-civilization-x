
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { useActionButtons } from "@/hooks/useActionButtons";
import { Separator } from "@/components/ui/separator";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const { resources } = state;
  
  const {
    handleLearnClick,
    handleApplyAllKnowledge,
    handlePractice,
    handleExchangeBitcoin,
    isButtonEnabled,
    practiceIsUnlocked,
    practiceBuildingExists,
    practiceCurrentCost,
    hasAutoMiner,
    applyKnowledgeUnlocked
  } = useActionButtons({ onAddEvent });
  
  // Проверяем, разблокирован ли USDT
  const isUsdtUnlocked = resources.usdt?.unlocked === true;
  
  // Проверяем, разблокирован ли Bitcoin
  const isBitcoinUnlocked = resources.bitcoin?.unlocked === true;
  
  return (
    <div className="border-t border-gray-200 pt-2 mt-auto">
      <div className="flex flex-col space-y-2">
        {/* Кнопка изучения всегда первая в вертикальном расположении */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLearnClick}
          className="w-full text-xs"
        >
          Изучить крипту
        </Button>
        
        {applyKnowledgeUnlocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyAllKnowledge}
            disabled={!isButtonEnabled("knowledge", 10)}
            className="w-full text-xs"
          >
            Применить знания
          </Button>
        )}
        
        {practiceIsUnlocked && isUsdtUnlocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePractice}
            disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
            className="w-full text-xs"
          >
            Практика ({practiceCurrentCost} USDT)
          </Button>
        )}
        
        {isBitcoinUnlocked && resources.bitcoin?.value > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExchangeBitcoin}
            className="w-full text-xs"
          >
            Обменять BTC
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
