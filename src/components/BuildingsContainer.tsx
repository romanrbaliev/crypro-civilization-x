
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingItem from '@/components/BuildingItem';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { t } from '@/localization';

export function BuildingsContainer() {
  const { state } = useGame();
  
  const handlePurchase = (buildingId: string) => {
    safeDispatchGameEvent(t("events.buildingPurchase", [t(`buildings.${buildingId}.name`)]), 'success');
  };
  
  // Фильтруем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">{t("ui.tabs.buildings")}</h2>
      {unlockedBuildings.length > 0 ? (
        <div className="space-y-3">
          {unlockedBuildings.map((building) => (
            <BuildingItem 
              key={building.id} 
              building={building} 
              onPurchase={() => handlePurchase(building.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>{t("ui.states.empty.buildings")}</p>
        </div>
      )}
    </div>
  );
}
