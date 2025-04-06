
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingItem from '@/components/BuildingItem';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { useTranslation } from '@/i18n';

export function BuildingsContainer() {
  const { state } = useGame();
  const { t } = useTranslation();
  
  const handlePurchase = (buildingName: string) => {
    safeDispatchGameEvent(`Построено здание: ${buildingName}`, 'success');
  };
  
  // Фильтруем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">{t('buildings.title')}</h2>
      {unlockedBuildings.length > 0 ? (
        <div className="space-y-3">
          {unlockedBuildings.map((building) => (
            <BuildingItem 
              key={building.id} 
              building={building} 
              onPurchase={() => handlePurchase(building.name)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>{t('buildings.empty')}</p>
          <p className="text-xs mt-1">{t('buildings.continue')}</p>
        </div>
      )}
    </div>
  );
}
