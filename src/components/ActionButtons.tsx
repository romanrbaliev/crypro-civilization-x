
import React from "react";
import { useActionButtons } from "@/hooks/useActionButtons";
import { Card, CardContent } from "@/components/ui/card";
import LearnButton from "./buttons/LearnButton";
import ApplyKnowledgeButton from "./buttons/ApplyKnowledgeButton";
import PracticeButton from "./buttons/PracticeButton";
import MineButton from "./buttons/MineButton";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";
import { useGame } from "@/context/hooks/useGame";

const ActionButtons: React.FC = () => {
  const { state } = useGame();
  const {
    handleLearnClick,
    handleApplyKnowledgeClick,
    handlePracticeClick,
    handleMineClick,
    handleExchangeBtcClick,
    isApplyKnowledgeUnlocked,
    isPracticeUnlocked,
    isUsdtUnlocked,
    isComputingPowerUnlocked,
    isBtcUnlocked,
    hasAutoMiner,
    hasPracticeBuilding,
    canMine,
    canExchangeBtc
  } = useActionButtons();

  // Проверка, достаточно ли знаний для применения
  const hasEnoughKnowledge = state.resources.knowledge.value >= 10;
  
  // Получаем уровень и стоимость практики
  const practiceLevel = state.buildings.practice.count + 1;
  const practiceCost = 25 * Math.pow(1.5, state.buildings.practice.count);

  return (
    <Card className="w-full">
      <CardContent className="p-3 space-y-3">
        {/* Кнопка "Изучить крипту" доступна всегда */}
        <LearnButton onClick={handleLearnClick} />

        {/* Кнопка "Применить знания" появляется после разблокировки */}
        {isApplyKnowledgeUnlocked && (
          <ApplyKnowledgeButton 
            onClick={handleApplyKnowledgeClick} 
            disabled={!hasEnoughKnowledge} 
          />
        )}

        {/* Кнопка "Практика" появляется после разблокировки */}
        {isPracticeUnlocked && !hasPracticeBuilding && (
          <PracticeButton 
            onClick={handlePracticeClick} 
            disabled={state.resources.usdt.value < practiceCost}
            level={practiceLevel}
            cost={practiceCost}
          />
        )}

        {/* Кнопка "Майнить USDT" появляется после разблокировки вычислительной мощности и отсутствия автомайнера */}
        {isComputingPowerUnlocked && !hasAutoMiner && (
          <MineButton onClick={handleMineClick} disabled={!canMine} />
        )}
        
        {/* Кнопка "Обменять BTC" появляется после разблокировки BTC */}
        {isBtcUnlocked && (
          <ExchangeBtcButton onClick={handleExchangeBtcClick} disabled={!canExchangeBtc} />
        )}
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
