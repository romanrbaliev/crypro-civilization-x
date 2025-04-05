
import React from 'react';
import { useGame } from '@/context/GameContext';
import BuildingCard from './BuildingCard';
import { formatNumber } from '@/utils/helpers';

const BuildingsTab: React.FC = () => {
  const { state } = useGame();
  
  // Получаем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings)
    .filter(building => building.unlocked)
    .sort((a, b) => a.id.localeCompare(b.id));
  
  // Если нет разблокированных зданий, показываем сообщение
  if (unlockedBuildings.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">
          Пока нет доступных зданий. Продолжайте изучать и применять знания, чтобы разблокировать первые здания.
        </p>
      </div>
    );
  }
  
  // Функции для вычисления стоимости здания
  const calculateCost = (building: any) => {
    const cost: {[key: string]: number} = {};
    if (!building.cost) return cost;
    
    Object.entries(building.cost).forEach(([resourceId, baseAmount]) => {
      const multiplier = building.costMultiplier || 1.15;
      cost[resourceId] = Math.floor(Number(baseAmount) * Math.pow(multiplier, building.count));
    });
    return cost;
  };
  
  const canAfford = (resources: any, cost: {[key: string]: number}) => {
    return Object.entries(cost).every(([resourceId, amount]) => {
      const resource = resources[resourceId];
      return resource && resource.value >= amount;
    });
  };
  
  return (
    <div className="h-full overflow-y-auto">
      {unlockedBuildings.map(building => (
        <BuildingCard key={building.id} building={building} />
      ))}
    </div>
  );
};

export default BuildingsTab;
