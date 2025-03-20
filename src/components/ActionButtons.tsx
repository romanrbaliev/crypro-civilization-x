
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/context/hooks/useGame";
import LearnButton from "./buttons/LearnButton";
import MineButton from "./buttons/MineButton";
import ApplyKnowledgeButton from "./buttons/ApplyKnowledgeButton";
import { useActionButtons } from "@/hooks/useActionButtons";
import { formatNumber } from "@/utils/helpers";

interface ActionButtonsProps {
  onAddEvent: (message: string, type?: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const {
    state,
    handleLearnClick,
    handleApplyKnowledge,
    handlePractice,
    handleMineClick,
    handleExchangeBtc,
    isButtonEnabled,
    practiceBuildingExists,
    practiceIsUnlocked,
    practiceCurrentCost,
    practiceCurrentLevel,
    hasAutoMiner,
    currentExchangeRate
  } = useActionButtons({ onAddEvent });

  // Проверяем, разблокированы ли соответствующие функции
  const applyKnowledgeUnlocked = state.unlocks.applyKnowledge || state.counters.applyKnowledge?.value > 0 || state.resources.knowledge.value >= 3;
  const miningUnlocked = state.resources.computingPower && state.resources.computingPower.unlocked;
  const exchangeBtcUnlocked = state.resources.btc && state.resources.btc.unlocked && state.resources.btc.value > 0;

  return (
    <div className="action-buttons-container space-y-2 my-2">
      {/* Основные действия */}
      <Card className="p-2 space-y-2">
        <LearnButton 
          onClick={handleLearnClick}
          className="mb-1"
        />

        {applyKnowledgeUnlocked && (
          <ApplyKnowledgeButton
            onClick={handleApplyKnowledge}
            disabled={!isButtonEnabled('knowledge', 10)}
            className="mb-1"
          />
        )}
        
        {practiceBuildingExists && practiceIsUnlocked && (
          <Button
            onClick={handlePractice}
            className="w-full mb-1"
            variant={isButtonEnabled('usdt', practiceCurrentCost) ? "default" : "outline"}
            size="sm"
            disabled={!isButtonEnabled('usdt', practiceCurrentCost)}
          >
            Практиковаться ({formatNumber(practiceCurrentCost)} USDT)
            {practiceCurrentLevel > 0 && (
              <Badge variant="secondary" className="ml-2">
                Уровень {practiceCurrentLevel}
              </Badge>
            )}
          </Button>
        )}
      </Card>

      {/* Майнинг и обмен */}
      {(miningUnlocked || exchangeBtcUnlocked) && (
        <Card className="p-2 space-y-2">
          {miningUnlocked && !hasAutoMiner && (
            <MineButton
              onClick={handleMineClick}
              disabled={!isButtonEnabled('computingPower', 50)}
              className="mb-1"
            />
          )}

          {exchangeBtcUnlocked && (
            <Button
              onClick={handleExchangeBtc}
              className="w-full"
              variant="outline"
              size="sm"
              disabled={state.resources.btc.value <= 0}
            >
              Обменять BTC на USDT
              <Badge variant="secondary" className="ml-2">
                Курс: {formatNumber(currentExchangeRate)} USDT
              </Badge>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default ActionButtons;
