
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingCard from './BuildingCard';
import { Building } from '@/types/game';

interface BuildingListProps {
  // дополнительные свойства, если нужны
}

const BuildingList: React.FC<BuildingListProps> = () => {
  const { state } = useGame();
  
  // Получаем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings)
    .filter(building => building.unlocked);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {unlockedBuildings.map(building => (
        <BuildingCard key={building.id} building={building} />
      ))}
    </div>
  );
};

export default BuildingList;
