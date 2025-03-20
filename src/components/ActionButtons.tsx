import React from "react";
import { LearnButton } from "@/components/ui/LearnButton";
import { ApplyKnowledgeButton } from "@/components/ui/ApplyKnowledgeButton";
import { MineButton } from "@/components/ui/MineButton";
import { useGame } from "@/context/hooks/useGame";
import { useIsMobile } from "@/hooks/use-mobile";
import ExchangeBtcButton from "./buttons/ExchangeBtcButton";

const ActionButtons = () => {
  const { state, dispatch } = useGame();
  const isMobile = useIsMobile();
  
  // Обработчики действий
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
  };
  
  const handleApplyKnowledge = () => {
    dispatch({ type: "APPLY_KNOWLEDGE" });
  };
  
  const handleMineClick = () => {
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };
  
  const handleExchangeBtc = () => {
    dispatch({ type: "EXCHANGE_BTC" });
  };
  
  // Получаем текущий курс BTC
  const getCurrentBtcRate = (): number => {
    const baseRate = state.miningParams.exchangeRate;
    const volatility = state.miningParams.volatility;
    const period = state.miningParams.exchangePeriod;
    const time = state.gameTime;
    
    // Расчет текущего курса с учетом волатильности
    return baseRate * (1 + volatility * Math.sin(time / period));
  };
  
  // Определяем, какие кнопки показывать
  const showApplyKnowledge = state.unlocks.applyKnowledge || false;
  const canApplyKnowledge = state.resources.knowledge.value >= 10;
  
  const showMineButton = state.resources.computingPower.unlocked && 
                         (!state.buildings.autoMiner || state.buildings.autoMiner.count === 0);
  const canMine = state.resources.computingPower.value >= 50;
  
  const showExchangeBtc = state.resources.btc.unlocked;
  const canExchangeBtc = state.resources.btc.value > 0;
  
  const currentBtcRate = getCurrentBtcRate();
  
  return (
    <div className="flex flex-col gap-2 p-2">
      <LearnButton 
        onClick={handleLearnClick} 
        className={`${isMobile ? 'text-sm' : ''}`}
      />
      
      {showApplyKnowledge && (
        <ApplyKnowledgeButton 
          onClick={handleApplyKnowledge} 
          disabled={!canApplyKnowledge} 
          className={`${isMobile ? 'text-sm' : ''}`}
        />
      )}
      
      {showMineButton && (
        <MineButton 
          onClick={handleMineClick} 
          disabled={!canMine} 
          className={`${isMobile ? 'text-sm' : ''}`}
        />
      )}
      
      {showExchangeBtc && (
        <ExchangeBtcButton 
          onClick={handleExchangeBtc} 
          disabled={!canExchangeBtc}
          currentRate={currentBtcRate}
        />
      )}
    </div>
  );
};

export default ActionButtons;
