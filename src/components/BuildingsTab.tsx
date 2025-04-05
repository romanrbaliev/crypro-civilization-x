
import React from 'react';
import { useGame } from '@/context/GameContext';
import BuildingCard from './BuildingCard';
import { Building } from '@/types/game';
import { calculateCost, canAfford } from '@/utils/helpers';

const BuildingsTab: React.FC = () => {
  const { state } = useGame();
  
  // Получаем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings)
    .filter(building => building.unlocked)
    .sort((a, b) => {
      // Сначала сортируем по доступности покупки
      const costA = calculateCost(a);
      const costB = calculateCost(b);
      const canAffordA = canAfford(state, costA);
      const canAffordB = canAfford(state, costB);
      
      if (canAffordA && !canAffordB) return -1;
      if (!canAffordA && canAffordB) return 1;
      
      // Затем по количеству (меньшее количество - выше)
      return a.count - b.count;
    });
  
  // Если нет разблокированных зданий, показываем сообщение
  if (unlockedBuildings.length === 0) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Здания</h2>
        <p>Пока нет доступных зданий. Продолжайте изучать и применять знания, чтобы разблокировать первые здания.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Здания</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unlockedBuildings.map(building => (
          <BuildingCard key={building.id} building={building} />
        ))}
      </div>
    </div>
  );
};

export default BuildingsTab;
