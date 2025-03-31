
import React, { useState } from 'react';
import { Building } from '@/context/types';
import { useGame } from '@/context/hooks/useGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatResourceValue } from '@/utils/resourceFormatConfig';
import { formatEffectName } from '@/utils/researchUtils';

interface BuildingCardProps {
  building: Building;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { state, dispatch } = useGame();
  const [showDetails, setShowDetails] = useState(false);
  
  // Рассчитываем стоимость с учетом текущего количества зданий
  const calculateCost = () => {
    const result: Record<string, number> = {};
    Object.entries(building.cost).forEach(([resourceId, baseAmount]) => {
      const multiplier = building.costMultiplier || 1.15;
      const amount = Math.floor(Number(baseAmount) * Math.pow(multiplier, building.count));
      result[resourceId] = amount;
    });
    return result;
  };
  
  const currentCost = calculateCost();
  
  const canAfford = () => {
    return Object.entries(currentCost).every(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      return resource && resource.value >= amount;
    });
  };
  
  const handlePurchase = () => {
    if (canAfford()) {
      dispatch({
        type: 'PURCHASE_BUILDING',
        payload: { buildingId: building.id }
      });
    }
  };
  
  const handleSellBuilding = () => {
    if (building.count > 0) {
      dispatch({
        type: 'SELL_BUILDING',
        payload: { buildingId: building.id }
      });
    }
  };
  
  const renderProduction = () => {
    if (!building.production) return null;
    
    return Object.entries(building.production).map(([resourceId, value]) => {
      if (resourceId.includes('Max') || resourceId.includes('Boost')) {
        // Форматируем специальные эффекты
        const effectName = formatEffectName(resourceId);
        const formattedValue = resourceId.includes('Boost') ? 
          `+${(Number(value) * 100).toFixed(0)}%` : 
          `+${value}`;
          
        return (
          <div key={resourceId} className="text-blue-600 text-xs">
            {effectName}: {formattedValue}
          </div>
        );
      }
      
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-green-600 text-xs">
          {resource.name}: +{value}/сек
        </div>
      );
    });
  };
  
  const renderConsumption = () => {
    if (!building.consumption) return null;
    
    return Object.entries(building.consumption).map(([resourceId, value]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-red-500 text-xs">
          {resource.name}: -{value}/сек
        </div>
      );
    });
  };
  
  const renderCost = () => {
    return Object.entries(currentCost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const hasEnough = resource.value >= amount;
      
      return (
        <div key={resourceId} className="flex justify-between">
          <span className={hasEnough ? "text-gray-600" : "text-red-500"}>
            {resource.name}:
          </span>
          <span className={hasEnough ? "text-gray-600" : "text-red-500"}>
            {formatResourceValue(amount, resourceId)}
          </span>
        </div>
      );
    });
  };
  
  return (
    <Card className={`mb-2 ${canAfford() ? 'bg-white' : 'bg-gray-50'}`}>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm flex justify-between">
          <span>{building.name} {building.count > 0 && `(${building.count})`}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 p-1 text-xs"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▲' : '▼'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="py-2 px-3 text-xs">
          <p className="text-gray-500 mb-2">{building.description}</p>
          
          <div className="mt-2">
            <h4 className="font-medium mb-1">Стоимость:</h4>
            {renderCost()}
          </div>
          
          <div className="mt-2">
            <h4 className="font-medium mb-1">Эффекты:</h4>
            {renderProduction()}
            {renderConsumption()}
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handlePurchase} 
              disabled={!canAfford()}
              variant="default"
              size="sm"
              className="flex-1"
            >
              {building.count === 0 ? "Построить" : "Улучшить"}
            </Button>
            {building.count > 0 && (
              <Button 
                onClick={handleSellBuilding}
                variant="outline"
                size="sm"
              >
                Продать
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BuildingCard;
