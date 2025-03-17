
import React from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import LearnButton from "@/components/buttons/LearnButton";
import ApplyKnowledgeButton from "@/components/buttons/ApplyKnowledgeButton";
import PracticeButton from "@/components/buttons/PracticeButton";
import MineButton from "@/components/buttons/MineButton";
import CryptoMiningPanel from "@/components/CryptoMiningPanel";

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
    isButtonEnabled,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner
  } = useActionButtons({ onAddEvent });
  
  // Создаем кнопки в обратном порядке - основная кнопка будет последней в массиве
  const buttons = [];
  
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
  
  // Добавляем основную кнопку в конец
  buttons.push(
    <div key="learn">
      <LearnButton onClick={handleLearnClick} />
    </div>
  );
  
  return (
    <div className="space-y-2 mt-2">
      {/* Отображаем панель майнинга, если у игрока есть автомайнер */}
      {hasAutoMiner && (
        <CryptoMiningPanel onAddEvent={onAddEvent} />
      )}
      
      {buttons}
    </div>
  );
};

export default ActionButtons;

