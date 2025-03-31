
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { useActionButtons } from "@/hooks/useActionButtons";
import {
  ChevronsUp,
  Zap,
  Brain,
  Bitcoin,
  DollarSign,
  Repeat,
  FastForward,
} from "lucide-react";

interface ActionButtonsProps {
  onAddEvent: (message: string, type: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  const { resources } = state;
  
  const {
    handleLearnClick,
    handleApplyKnowledge,
    handleApplyAllKnowledge,
    handlePractice,
    handleExchangeBitcoin,
    isButtonEnabled,
    practiceIsUnlocked,
    practiceBuildingExists,
    practiceCurrentCost,
    hasAutoMiner,
    shouldHideLearnButton,
    applyKnowledgeUnlocked
  } = useActionButtons({ onAddEvent });
  
  // Проверяем, разблокирован ли USDT
  const isUsdtUnlocked = resources.usdt?.unlocked === true;
  
  // Проверяем, разблокирован ли Bitcoin
  const isBitcoinUnlocked = resources.bitcoin?.unlocked === true;
  
  // Логирование для отладки
  console.log("Состояние разблокировки кнопки 'Применить знания':", applyKnowledgeUnlocked);
  console.log("Счетчик кликов знаний:", state.counters.knowledgeClicks?.value || 0);
  console.log("Счетчик применений знаний:", state.counters.applyKnowledge?.value || 0);
  console.log("isUsdtUnlocked:", isUsdtUnlocked);
  console.log("Bitcoin разблокирован:", isBitcoinUnlocked);
  console.log("Значение Bitcoin:", resources.bitcoin?.value || 0);

  if (practiceIsUnlocked) {
    console.log("Практика разблокирована, стоимость:", practiceCurrentCost);
  } else {
    console.log("Кнопка практики не разблокирована. practiceIsUnlocked:", practiceIsUnlocked);
    console.log("state.unlocks.practice:", state.unlocks.practice);
    console.log("applyKnowledge счетчик:", state.counters.applyKnowledge?.value || 0);
  }
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {!shouldHideLearnButton && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLearnClick}
          className="flex items-center"
        >
          <Brain className="mr-1.5 h-4 w-4" />
          Изучить крипту
        </Button>
      )}
      
      {applyKnowledgeUnlocked && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleApplyKnowledge}
            disabled={!isButtonEnabled("knowledge", 10)}
            className="flex items-center"
          >
            <DollarSign className="mr-1.5 h-4 w-4" />
            Применить знания (10)
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleApplyAllKnowledge}
            disabled={!isButtonEnabled("knowledge", 10)}
            className="flex items-center"
          >
            <FastForward className="mr-1.5 h-4 w-4" />
            Применить все знания
          </Button>
        </>
      )}
      
      {practiceIsUnlocked && isUsdtUnlocked && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePractice}
          disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
          className="flex items-center"
        >
          <ChevronsUp className="mr-1.5 h-4 w-4" />
          Практика ({practiceCurrentCost} USDT)
        </Button>
      )}
      
      {isBitcoinUnlocked && resources.bitcoin?.value > 0 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExchangeBitcoin}
          className="flex items-center"
        >
          <Repeat className="mr-1.5 h-4 w-4" />
          Обменять BTC
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
