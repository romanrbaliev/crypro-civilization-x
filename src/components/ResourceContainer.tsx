
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { formatNumber } from '@/utils/helpers';

export function ResourceContainer() {
  // Используем обновленный хук с правильным доступом к state
  const { state } = useGameState();
  
  // Фильтруем только разблокированные ресурсы
  const unlockedResources = Object.values(state.resources).filter(
    resource => resource.unlocked
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">Ресурсы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unlockedResources.map((resource) => (
          <div key={resource.id} className="flex justify-between items-center border-b pb-1">
            <div className="flex items-center">
              <span className="text-sm font-medium">{resource.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold">{formatNumber(resource.value)}</span>
              {resource.perSecond !== 0 && (
                <span className={`text-xs ${resource.perSecond > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {resource.perSecond > 0 ? '+' : ''}{formatNumber(resource.perSecond)}/сек
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
