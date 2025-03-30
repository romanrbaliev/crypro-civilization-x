
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "./ui/button";
import { LucideIcon, BadgeDollarSign, Coins } from "lucide-react";
import { GameEvent } from "./EventLog";

interface ActionButtonProps {
  id: string;
  label: string;
  color?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}

interface ActionButtonsProps {
  onAddEvent: (message: string, type?: GameEvent["type"]) => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  id,
  label,
  color = "bg-blue-500 hover:bg-blue-600",
  icon: Icon,
  disabled = false,
  onClick
}) => {
  return (
    <Button
      id={id}
      className={`w-full ${color}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
};

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent }) => {
  const { state, dispatch } = useGame();
  
  const handleLearnCrypto = () => {
    // Добавили диспетч конкретно для изучения криптовалют
    if (state.resources.knowledge?.unlocked) {
      dispatch({ type: "LEARN_CRYPTO" });
    } else {
      onAddEvent("Знания о криптовалютах пока недоступны", "warning");
    }
  };
  
  const handleApplyKnowledge = () => {
    dispatch({ type: "APPLY_KNOWLEDGE" });
  };
  
  const handleApplyAllKnowledge = () => {
    dispatch({ type: "APPLY_ALL_KNOWLEDGE" });
  };
  
  const handleMiningPower = () => {
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };
  
  const handleExchangeBtc = () => {
    dispatch({ type: "EXCHANGE_BTC" });
  };

  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <ActionButton
        id="learn-crypto"
        label="Изучить крипту"
        color="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        onClick={handleLearnCrypto}
        disabled={!state.resources.knowledge?.unlocked}
      />
      
      {state.unlocks.applyKnowledge && (
        <ActionButton
          id="apply-knowledge"
          label="Применить знания"
          icon={BadgeDollarSign}
          color="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          onClick={handleApplyKnowledge}
          disabled={!state.resources.knowledge || state.resources.knowledge.value < 10}
        />
      )}
      
      {state.unlocks.applyKnowledge && state.resources.knowledge?.value >= 20 && (
        <ActionButton
          id="apply-all-knowledge"
          label="Применить все знания"
          icon={BadgeDollarSign}
          color="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          onClick={handleApplyAllKnowledge}
          disabled={!state.resources.knowledge || state.resources.knowledge.value < 10}
        />
      )}
      
      {state.unlocks.miningPower && (
        <ActionButton
          id="mine-computing-power"
          label="Майнинг"
          icon={Coins}
          color="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          onClick={handleMiningPower}
          disabled={!state.resources.computingPower || state.resources.computingPower.value < 50}
        />
      )}
      
      {state.unlocks.exchangeBitcoin && (
        <ActionButton
          id="exchange-btc"
          label={`Обменять BTC (${state.resources.bitcoin?.value?.toFixed(8) || 0})`}
          icon={Coins}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
          onClick={handleExchangeBtc}
          disabled={!state.resources.bitcoin || state.resources.bitcoin.value <= 0}
        />
      )}
    </div>
  );
};

export default ActionButtons;
