
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingItem from '@/components/BuildingItem';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';

export function BuildingsContainer() {
  const { state } = useGame();
  
  const handlePurchase = (buildingName: string) => {
    safeDispatchGameEvent(`Построено здание: ${buildingName}`, 'success');
  };
  
  // Фильтруем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  // Выводим дополнительную отладочную информацию
  console.log("BuildingsContainer: Все здания:", Object.keys(state.buildings));
  console.log("BuildingsContainer: Разблокированные здания:", 
    unlockedBuildings.map(b => `${b.id} (unlocked=${b.unlocked}, count=${b.count})`));
  
  // Проверяем состояние здания "Практика"
  const practiceBuilding = state.buildings.practice;
  console.log("BuildingsContainer: Статус здания Практика:", 
    practiceBuilding ? 
    `существует, unlocked=${practiceBuilding.unlocked}, count=${practiceBuilding.count}` : 
    "отсутствует в state.buildings");
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">Здания</h2>
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
          <p>У вас пока нет доступных зданий.</p>
          <p className="text-xs mt-1">Продолжайте накапливать ресурсы, чтобы разблокировать здания.</p>
        </div>
      )}
    </div>
  );
}
