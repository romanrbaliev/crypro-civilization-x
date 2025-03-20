
import React from "react";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";

const GameHeader: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="game-header bg-gradient-to-r from-blue-800 to-purple-800 p-3 text-white rounded-b-lg mb-4 shadow-md">
      <h1 className="text-lg font-bold text-center">Crypto Civilization</h1>
      <div className="flex justify-between text-xs mt-1">
        <div>Фаза: {state.phase}</div>
        <div>USDT: {formatNumber(state.resources.usdt?.value ?? 0)}</div>
        <div>BTC: {formatNumber(state.resources.btc?.value ?? 0, 8)}</div>
      </div>
    </div>
  );
};

export default GameHeader;
