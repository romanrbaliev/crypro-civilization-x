
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingItem from '@/components/BuildingItem';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export function BuildingsContainer() {
  const { state, dispatch } = useGame();
  
  const handleBuy = (buildingId: string) => {
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId } });
    safeDispatchGameEvent(`Построено здание: ${state.buildings[buildingId].name}`, 'success');
  };
  
  // Фильтруем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">Здания</h2>
      {unlockedBuildings.length > 0 ? (
        <div className="space-y-3">
          {unlockedBuildings.map((building) => (
            <BuildingItem 
              key={building.id} 
              building={building}
              resources={state.resources}
              onBuy={() => handleBuy(building.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>У вас пока нет доступных зданий.</p>
          <p className="text-xs mt-1">Продолжайте накапливать ресурсы, чтобы разблокировать здания.</p>
        </div>
      )}
    </div>
  );
}
