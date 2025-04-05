
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Upgrade } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { formatNumber } from '@/utils/helpers';

export function ResearchContainer() {
  const { state, dispatch } = useGameState();
  
  const handlePurchase = (upgrade: Upgrade) => {
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { upgradeId: upgrade.id } });
    safeDispatchGameEvent(`Исследование завершено: ${upgrade.name}`, 'success');
  };
  
  // Фильтруем только разблокированные и не купленные исследования
  const availableResearch = Object.values(state.upgrades).filter(
    upgrade => upgrade.unlocked && !upgrade.purchased
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">Исследования</h2>
      {availableResearch.length > 0 ? (
        <div className="space-y-3">
          {availableResearch.map((upgrade) => (
            <div key={upgrade.id} className="border p-3 rounded-md">
              <div className="flex justify-between">
                <h3 className="font-medium">{upgrade.name}</h3>
                <button
                  onClick={() => handlePurchase(upgrade)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs"
                  disabled={!canAfford(upgrade, state)}
                >
                  Исследовать
                </button>
              </div>
              <p className="text-sm text-gray-600 my-1">{upgrade.description}</p>
              <div className="text-xs text-gray-500">
                {Object.entries(upgrade.cost).map(([resource, amount]) => (
                  <div key={resource} className="flex justify-between">
                    <span>{state.resources[resource]?.name}:</span>
                    <span>
                      {formatNumber(Number(amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>У вас нет доступных исследований.</p>
          <p className="text-xs mt-1">Продолжайте прогрессировать, чтобы разблокировать новые исследования.</p>
        </div>
      )}
    </div>
  );
}

// Функция для проверки возможности приобретения исследования
function canAfford(upgrade: Upgrade, state: any): boolean {
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }
  return true;
}
