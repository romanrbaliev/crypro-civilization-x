
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { formatNumber } from '@/utils/helpers';
import ResourceDisplay from './ResourceDisplay';

export function ResourceContainer() {
  const { state } = useGameState();
  
  // Фильтруем только разблокированные ресурсы
  const unlockedResources = Object.values(state.resources)
    .filter(resource => resource.unlocked)
    // Добавляем сортировку, чтобы ресурсы всегда отображались в одинаковом порядке
    .sort((a, b) => {
      // Фиксированный порядок ресурсов
      const order = {
        'knowledge': 1,
        'usdt': 2,
        'electricity': 3,
        'computingPower': 4,
        'bitcoin': 5
      };
      
      const orderA = order[a.id] || 99;
      const orderB = order[b.id] || 99;
      
      return orderA - orderB;
    });
  
  console.log("ResourceContainer: разблокированные ресурсы", 
    unlockedResources.map(r => `${r.id} (unlocked=${r.unlocked}, value=${r.value})`));
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">Ресурсы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {unlockedResources.map((resource) => (
          <div key={resource.id} className="flex justify-between items-center border-b pb-1">
            <ResourceDisplay resource={resource} />
          </div>
        ))}
      </div>
    </div>
  );
}
