
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, canAfford, calculateCost } from '@/utils/helpers';
import { useGame } from '@/context/GameContext';
import { Building } from '@/types/game';

interface BuildingCardProps {
  building: Building;
  id: string;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, id }) => {
  const { state, dispatch } = useGame();
  
  // Расчет текущей стоимости здания
  const calculateCurrentCost = () => {
    const costs = Object.entries(building.cost).map(([resourceId, baseCost]) => {
      const scaledCost = calculateCost(baseCost, building.costMultiplier, building.count);
      return {
        resourceId,
        amount: scaledCost
      };
    });
    
    return costs;
  };
  
  // Проверка, можно ли купить здание
  const canPurchase = () => {
    return canAfford(
      Object.fromEntries(
        calculateCurrentCost().map(({ resourceId, amount }) => [resourceId, amount])
      ),
      state.resources
    );
  };
  
  // Информация о производстве и потреблении
  const renderProductionInfo = () => {
    if (!building.production && !building.consumption) {
      return null;
    }
    
    return (
      <div className="mt-2 space-y-1 text-sm">
        {building.production && Object.entries(building.production).map(([resourceId, amount]) => (
          <div key={`prod-${resourceId}`} className="text-green-600">
            +{formatNumber(amount, 2)} {state.resources[resourceId]?.name || resourceId}/сек
          </div>
        ))}
        
        {building.consumption && Object.entries(building.consumption).map(([resourceId, amount]) => (
          <div key={`cons-${resourceId}`} className="text-red-600">
            -{formatNumber(amount, 2)} {state.resources[resourceId]?.name || resourceId}/сек
          </div>
        ))}
      </div>
    );
  };
  
  // Обработчик покупки здания
  const handlePurchase = () => {
    dispatch({ type: 'PURCHASE_BUILDING', payload: { buildingId: id } });
  };
  
  // Обработчик продажи здания
  const handleSell = () => {
    dispatch({ type: 'SELL_BUILDING', payload: { buildingId: id } });
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between">
          <span>{building.name}</span>
          <span>{building.count}</span>
        </CardTitle>
        <CardDescription>{building.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {renderProductionInfo()}
        
        <div className="mt-3 space-y-1 text-sm">
          <div className="font-semibold">Стоимость:</div>
          {calculateCurrentCost().map(({ resourceId, amount }) => (
            <div key={`cost-${resourceId}`} className={
              (state.resources[resourceId]?.value || 0) >= amount 
                ? "text-green-600" 
                : "text-red-600"
            }>
              {formatNumber(amount, 2)} {state.resources[resourceId]?.name || resourceId}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handlePurchase}
          disabled={!canPurchase()}
          variant="default"
        >
          Купить
        </Button>
        
        {building.count > 0 && (
          <Button 
            onClick={handleSell}
            variant="outline"
            className="ml-2"
          >
            Продать
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BuildingCard;
