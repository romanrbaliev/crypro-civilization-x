
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import BuildingItem from './BuildingItem';

interface BuildingTabProps {
  onAddEvent: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const BuildingTab: React.FC<BuildingTabProps> = ({ onAddEvent }) => {
  const { state } = useGame();
  
  // Получаем отфильтрованный список зданий, показываем только разблокированные
  const unlockedBuildings = Object.values(state.buildings)
    .filter(building => building.unlocked)
    .sort((a, b) => {
      // Сортировка: сначала по возможности покупки, затем по стоимости
      const canAffordA = Object.entries(a.cost).every(
        ([resourceId, amount]) => state.resources[resourceId]?.value >= amount
      );
      const canAffordB = Object.entries(b.cost).every(
        ([resourceId, amount]) => state.resources[resourceId]?.value >= amount
      );
      
      if (canAffordA && !canAffordB) return -1;
      if (!canAffordA && canAffordB) return 1;
      
      // Затем по стоимости USDT (если она есть в cost)
      const costA = a.cost.usdt || 0;
      const costB = b.cost.usdt || 0;
      return costA - costB;
    });
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Доступные здания</h2>
      
      {unlockedBuildings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {unlockedBuildings.map(building => (
            <BuildingItem 
              key={building.id} 
              building={building}
              onAddEvent={onAddEvent}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Нет доступных зданий. Продолжайте изучать крипту и накапливать ресурсы.
        </div>
      )}
    </div>
  );
};

export default BuildingTab;
