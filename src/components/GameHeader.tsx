
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { formatNumber } from '@/utils/helpers';

export function GameHeader() {
  const { state } = useGameState();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Crypto Civilization</h1>
        {state.phase > 0 && (
          <span className="text-sm text-gray-500">Фаза: {state.phase}</span>
        )}
      </div>
      
      {state.prestigePoints > 0 && (
        <div className="bg-amber-100 px-3 py-1 rounded-full">
          <span className="text-amber-800 font-medium">
            Очки престижа: {formatNumber(state.prestigePoints)}
          </span>
        </div>
      )}
    </div>
  );
}
