
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Building } from '@/types/game';
import { formatNumber } from '@/utils/helpers';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { state, dispatch } = useGame();
  const [expanded, setExpanded] = useState(false);
  
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
  
  // Функции для вычисления стоимости здания
  const calculateCost = (building: Building) => {
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
  
  const cost = calculateCost(building);
  const canPurchase = canAfford(state.resources, cost);
  
  // Преобразуем стоимость в строку
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, amount]) => {
      const resourceName = state.resources[resourceId]?.name || resourceId;
      return (
        <div key={resourceId} className="flex justify-between">
          <span>{resourceName}</span>
          <span className="text-red-500">{formatNumber(amount)}</span>
        </div>
      );
    });
  };
  
  // Преобразуем производство в строку
  const renderProduction = () => {
    if (!building.production) return null;
    
    return Object.entries(building.production).map(([resourceId, amount]) => {
      const resourceName = state.resources[resourceId]?.name || resourceId;
      return (
        <div key={resourceId} className="flex justify-between">
          <span className="text-green-500">{resourceName}</span>
          <span className="text-green-500">+{formatNumber(Number(amount))}/сек</span>
        </div>
      );
    });
  };
  
  // Преобразуем потребление в строку
  const renderConsumption = () => {
    if (!building.consumption) return null;
    
    return Object.entries(building.consumption).map(([resourceId, amount]) => {
      const resourceName = state.resources[resourceId]?.name || resourceId;
      return (
        <div key={resourceId} className="flex justify-between">
          <span className="text-red-500">{resourceName}</span>
          <span className="text-red-500">-{formatNumber(Number(amount))}/сек</span>
        </div>
      );
    });
  };
  
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden mb-3">
      {/* Заголовок карточки */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-medium">
            {building.name} {building.count > 0 && `×${building.count}`}
          </h3>
        </div>
        {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </div>
      
      {/* Содержимое карточки (раскрывается при клике) */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-200">
          <p className="text-gray-500 mb-3">{building.description}</p>
          
          {/* Стоимость */}
          <div className="mb-3">
            <h4 className="font-medium mb-1">Стоимость:</h4>
            {renderCost()}
          </div>
          
          {/* Производство */}
          {building.production && Object.keys(building.production).length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Производит:</h4>
              {renderProduction()}
            </div>
          )}
          
          {/* Потребление */}
          {building.consumption && Object.keys(building.consumption).length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Потребляет:</h4>
              {renderConsumption()}
            </div>
          )}
          
          {/* Кнопки действий */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={handlePurchase}
              disabled={!canPurchase}
              variant="outline"
              className="w-full"
            >
              Купить
            </Button>
            
            {building.count > 0 && (
              <Button
                onClick={handleSell}
                variant="outline"
                className="w-full"
              >
                Продать
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingCard;
