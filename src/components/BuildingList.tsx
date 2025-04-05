
import React from 'react';
import { useGame } from '@/context/GameContext';
import BuildingCard from './BuildingCard';

const BuildingList: React.FC = () => {
  const { state } = useGame();

  // Рендер доступных зданий
  const renderBuildingItems = () => {
    return Object.entries(state.buildings)
      .filter(([, building]) => building.unlocked)
      .map(([id, building]) => (
        <BuildingCard 
          key={id} 
          building={building} 
          id={id}
        />
      ));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Здания</h2>
      {renderBuildingItems()}
    </div>
  );
};

export default BuildingList;
