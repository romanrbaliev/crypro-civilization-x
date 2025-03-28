
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { Brain, Coins } from "lucide-react";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";
import PracticeButton from "./buttons/PracticeButton";
import { useActionButtons } from "@/hooks/useActionButtons";
import LearnButton from "./buttons/LearnButton";

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
    currentExchangeRate,
    shouldHideLearnButton
  } = useActionButtons({ onAddEvent });
  
  const hasApplyKnowledge = state.unlocks.applyKnowledge;
  
  // Получаем значения ресурсов для проверки доступности кнопок
  const { knowledge, usdt, btc } = state.resources;
  
  // Проверка на возможность обмена BTC
  const canExchangeBtc = 
    btc.unlocked && 
    btc.value > 0 && 
    usdt.value + (btc.value * currentExchangeRate) <= usdt.max;
  
  // Массив компонентов кнопок, которые будем рендерить
  const buttonComponents = [];
  
  // Кнопка обмена BTC (если разблокирована)
  if (btc.unlocked) {
    buttonComponents.push(
      <ExchangeBtcButton 
        key="exchange"
        onClick={handleExchangeBtc}
        disabled={!canExchangeBtc}
        className="w-full"
        currentRate={currentExchangeRate}
      />
    );
  }
  
  // Кнопка Практика (если разблокирована)
  if (practiceIsUnlocked) {
    console.log("Кнопка практики разблокирована, добавляем на экран");
    buttonComponents.push(
      <PracticeButton
        key="practice"
        onClick={handlePractice}
        disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
        level={practiceCurrentLevel}
        cost={practiceCurrentCost}
      />
    );
  } else {
    console.log("Кнопка практики не разблокирована. practiceIsUnlocked:", practiceIsUnlocked);
    console.log("state.unlocks.practice:", state.unlocks.practice);
    console.log("applyKnowledge счетчик:", state.counters.applyKnowledge?.value);
  }
  
  // Кнопка Применить знания (если разблокирована)
  if (hasApplyKnowledge) {
    buttonComponents.push(
      <Button
        key="apply"
        onClick={handleApplyKnowledge}
        className="w-full"
        size="sm"
        disabled={knowledge.value < 10}
        variant={knowledge.value < 10 ? "outline" : "default"}
      >
        <Coins className="mr-2 h-4 w-4" />
        Применить знания
      </Button>
    );
  }
  
  // Кнопка Изучить крипту - добавляем только если не нужно скрывать
  if (!shouldHideLearnButton) {
    buttonComponents.push(
      <LearnButton
        key="learn"
        onClick={handleLearnClick}
        className="w-full"
        shouldHide={shouldHideLearnButton}
      />
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      {buttonComponents}
    </div>
  );
};

export default ActionButtons;
