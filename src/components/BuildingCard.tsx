
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Building } from '@/types/game';
import { formatNumber, canAfford, calculateCost } from '@/utils/helpers';
import { Home, X } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { state, dispatch } = useGame();
  
  const handlePurchase = () => {
    dispatch({
      type: 'PURCHASE_BUILDING',
      payload: { buildingId: building.id }
    });
  };
  
  const handleSell = () => {
    dispatch({
      type: 'SELL_BUILDING',
      payload: { buildingId: building.id }
    });
  };
  
  const cost = calculateCost(building);
  const canPurchase = canAfford(state.resources, cost);
  
  // Преобразуем объект cost в читабельную строку
  const costString = Object.entries(cost)
    .map(([resourceId, amount]) => {
      const resourceName = state.resources[resourceId]?.name || resourceId;
      return `${formatNumber(Number(amount))} ${resourceName}`;
    })
    .join(', ');
  
  // Преобразуем объект production в читабельную строку
  const productionString = building.production ? 
    Object.entries(building.production)
      .map(([resourceId, amount]) => {
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return `+${formatNumber(Number(amount))}/сек ${resourceName}`;
      })
      .join(', ') : '';
  
  // Преобразуем объект consumption в читабельную строку  
  const consumptionString = building.consumption ? 
    Object.entries(building.consumption)
      .map(([resourceId, amount]) => {
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return `-${formatNumber(Number(amount))}/сек ${resourceName}`;
      })
      .join(', ') : '';
  
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{building.name}</h3>
        <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded dark:bg-blue-900 dark:text-blue-200">
          {building.count}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{building.description}</p>
      
      <div className="space-y-1 mb-3 text-sm">
        {productionString && (
          <div className="text-green-600 dark:text-green-400">{productionString}</div>
        )}
        {consumptionString && (
          <div className="text-red-600 dark:text-red-400">{consumptionString}</div>
        )}
        <div className="text-gray-500 dark:text-gray-400">
          Стоимость: {costString}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={handlePurchase}
          disabled={!canPurchase}
          variant={canPurchase ? "default" : "outline"}
          className="flex-1"
        >
          <Home className="mr-2 h-4 w-4" /> Купить
        </Button>
        
        {building.count > 0 && (
          <Button
            onClick={handleSell}
            variant="destructive"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BuildingCard;
