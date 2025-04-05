
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Building } from '@/context/types';
import { calculateCost, canAfford, formatNumber } from '@/utils/helpers';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const BuildingsTab: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Получаем разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  // Обработчик покупки здания
  const handlePurchase = (buildingId: string) => {
    dispatch({ type: 'PURCHASE_BUILDING', payload: { buildingId } });
  };
  
  // Функция для отображения стоимости здания
  const renderCost = (building: Building) => {
    // Рассчитываем стоимость следующего уровня
    const costs = Object.entries(building.cost).map(([resourceId, baseCost]) => {
      const cost = calculateCost(baseCost, building.costMultiplier, building.count);
      const resourceValue = state.resources[resourceId]?.value || 0;
      const canBuy = resourceValue >= cost;
      
      return (
        <span 
          key={resourceId}
          className={`text-sm ${canBuy ? 'text-gray-600' : 'text-red-500'}`}
        >
          {state.resources[resourceId]?.name}: {formatNumber(cost)}
        </span>
      );
    });
    
    return (
      <div className="flex flex-col gap-1">
        {costs}
      </div>
    );
  };
  
  // Функция для проверки, может ли игрок позволить здание
  const canPurchase = (building: Building) => {
    const nextLevelCosts: { [key: string]: number } = {};
    
    Object.entries(building.cost).forEach(([resourceId, baseCost]) => {
      nextLevelCosts[resourceId] = calculateCost(
        baseCost,
        building.costMultiplier,
        building.count
      );
    });
    
    const currentResources: { [key: string]: number } = {};
    Object.entries(state.resources).forEach(([resourceId, resource]) => {
      currentResources[resourceId] = resource.value;
    });
    
    return canAfford(currentResources, nextLevelCosts);
  };
  
  // Функция для отображения производства и потребления здания
  const renderProductionInfo = (building: Building) => {
    const productionItems = building.production ? Object.entries(building.production).map(
      ([resourceId, amount]) => (
        <div key={`prod-${resourceId}`} className="text-sm text-green-600">
          +{formatNumber(amount)} {state.resources[resourceId]?.name || resourceId}
        </div>
      )
    ) : null;
    
    const consumptionItems = building.consumption ? Object.entries(building.consumption).map(
      ([resourceId, amount]) => (
        <div key={`cons-${resourceId}`} className="text-sm text-red-600">
          -{formatNumber(amount)} {state.resources[resourceId]?.name || resourceId}
        </div>
      )
    ) : null;
    
    return (
      <div className="space-y-1">
        {productionItems}
        {consumptionItems}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Здания</h2>
      
      {unlockedBuildings.length === 0 ? (
        <p className="text-gray-500">Пока нет доступных зданий.</p>
      ) : (
        <div className="space-y-3">
          {unlockedBuildings.map(building => (
            <div
              key={building.id}
              className="p-3 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-semibold">{building.name} ({building.count})</div>
                  <div className="text-sm text-gray-600">{building.description}</div>
                  {renderProductionInfo(building)}
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        disabled={!canPurchase(building)}
                        onClick={() => handlePurchase(building.id)}
                      >
                        Купить
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {renderCost(building)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildingsTab;
