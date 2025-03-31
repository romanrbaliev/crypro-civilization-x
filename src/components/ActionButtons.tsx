
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { useActionButtons } from "@/hooks/useActionButtons";

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
      {/* Сначала отображаем другие кнопки, потом Изучить крипту */}
      
      {isBitcoinUnlocked && resources.bitcoin?.value > 0 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExchangeBitcoin}
          className="flex items-center"
        >
          Обменять BTC
        </Button>
      )}
      
      {practiceIsUnlocked && isUsdtUnlocked && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePractice}
          disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
          className="flex items-center"
        >
          Практика ({practiceCurrentCost} USDT)
        </Button>
      )}
      
      {applyKnowledgeUnlocked && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleApplyAllKnowledge}
          disabled={!isButtonEnabled("knowledge", 10)}
          className="flex items-center"
        >
          Применить знания
        </Button>
      )}
      
      {/* Кнопка изучения всегда последняя */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleLearnClick}
        className="flex items-center"
      >
        Изучить крипту
      </Button>
    </div>
  );
};

export default ActionButtons;
