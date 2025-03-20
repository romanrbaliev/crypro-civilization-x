
import React from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import LearnButton from "@/components/buttons/LearnButton";
import ApplyKnowledgeButton from "@/components/buttons/ApplyKnowledgeButton";
import PracticeButton from "@/components/buttons/PracticeButton";
import MineButton from "@/components/buttons/MineButton";
import ExchangeBtcButton from "@/components/buttons/ExchangeBtcButton";

interface ActionButtonsProps {
  onAddEvent?: (message: string, type?: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent = () => {} }) => {
  const {
    state,
    handleLearnClick,
    handleApplyKnowledge,
    handlePractice,
    handleMineClick,
    handleExchangeBtc,
    isButtonEnabled,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate
  } = useActionButtons({ onAddEvent });
  
  // Создаем кнопки в обратном порядке - основная кнопка будет последней в массиве
  const buttons = [];
  
  // Кнопка обмена BTC (если ресурс разблокирован)
  if (state.resources.btc && state.resources.btc.unlocked) {
    buttons.push(
      <div key="exchange">
        <ExchangeBtcButton
          onClick={handleExchangeBtc}
          disabled={state.resources.btc.value <= 0}
          currentRate={currentExchangeRate}
        />
      </div>
    );
  }
  
  // Кнопка майнинга (если она доступна и нет автомайнера)
  if (state.resources.computingPower.unlocked && !hasAutoMiner) {
    buttons.push(
      <div key="mine">
        <MineButton
          onClick={handleMineClick}
          disabled={!isButtonEnabled("computingPower", 50)}
        />
      </div>
    );
  }
  
  // Кнопка практики (если доступна)
  if (state.unlocks.practice) {
    console.log(`Рендерим кнопку Практиковаться: cost=${practiceCurrentCost}`);
    buttons.push(
      <div key="practice">
        <PracticeButton
          onClick={handlePractice}
          disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
          level={practiceCurrentLevel}
          cost={practiceCurrentCost}
        />
      </div>
    );
  }
  
  // Кнопка применения знаний (если доступна)
  if (state.unlocks.applyKnowledge) {
    buttons.push(
      <div key="apply">
        <ApplyKnowledgeButton
          onClick={handleApplyKnowledge}
          disabled={!isButtonEnabled("knowledge", 10)}
        />
      </div>
    );
  }
  
  // Добавляем основную кнопку в конец, только если скорость накопления знаний меньше 10
  if (state.resources.knowledge.perSecond < 10) {
    buttons.push(
      <div key="learn">
        <LearnButton onClick={handleLearnClick} />
      </div>
    );
  }
  
  return (
    <div className="space-y-2 mt-2">
      {buttons}
    </div>
  );
};

export default ActionButtons;
