
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
  
  // Формируем массив кнопок в порядке отображения 
  // (новые кнопки появляются над "Изучить крипту")
  const buttons = [];
  
  // Добавляем кнопку обмена BTC, если биткоин разблокирован
  if (btc.unlocked) {
    buttons.push(
      <ExchangeBtcButton 
        key="exchange"
        onClick={handleExchangeBtc}
        disabled={!canExchangeBtc}
        className="w-full"
        currentRate={currentExchangeRate}
      />
    );
  }
  
  // Добавляем кнопку Практиковаться, если она разблокирована и доступна
  if (state.unlocks.practice) {
    buttons.push(
      <PracticeButton
        key="practice"
        onClick={handlePractice}
        disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
        level={practiceCurrentLevel}
        cost={practiceCurrentCost}
      />
    );
  }
  
  // Добавляем кнопку Применить знания, если она разблокирована
  if (hasApplyKnowledge) {
    buttons.push(
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
  
  // Обязательно добавляем кнопку Изучить крипту последней,
  // чтобы она всегда была внизу
  buttons.push(
    <Button
      key="learn"
      onClick={handleLearnClick}
      className="w-full"
      size="sm"
    >
      <Brain className="mr-2 h-4 w-4" />
      Изучить крипту
    </Button>
  );
  
  return (
    <div className="flex flex-col gap-2">
      {buttons}
    </div>
  );
};

export default ActionButtons;
