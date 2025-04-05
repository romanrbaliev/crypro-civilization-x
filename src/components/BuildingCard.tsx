
import React from 'react';
import { Building } from '@/types/game';
import { useGame } from '@/context/hooks/useGame';
import { Button } from './ui/button';
import { formatNumber } from '@/utils/helpers';
import { canAfford, calculateCost } from '@/utils/helpers';

interface BuildingCardProps {
  building: Building;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { state, dispatch } = useGame();
  
  // Получаем стоимость здания с учетом уже построенных
  const cost = calculateCost(building);
  
  // Проверяем, можем ли мы позволить себе это здание
  const affordable = canAfford(state.resources, cost);
  
  // Обработчик покупки здания
  const handlePurchase = () => {
    dispatch({
      type: 'PURCHASE_BUILDING',
      payload: { buildingId: building.id }
    });
  };
  
  // Вычисляем эффекты здания
  const renderEffects = () => {
    if (building.production) {
      return Object.entries(building.production).map(([resourceId, amount]) => (
        <div key={resourceId} className="text-xs text-gray-600">
          +{amount} {state.resources[resourceId]?.name || resourceId}/сек
        </div>
      ));
    }
    
    return null;
  };
  
  // Вычисляем потребление ресурсов
  const renderConsumption = () => {
    if (building.consumption) {
      return Object.entries(building.consumption).map(([resourceId, amount]) => (
        <div key={resourceId} className="text-xs text-gray-600">
          -{amount} {state.resources[resourceId]?.name || resourceId}/сек
        </div>
      ));
    }
    
    return null;
  };
  
  // Отображаем стоимость здания
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const resourceName = resource?.name || resourceId;
      const hasEnough = resource && resource.value >= amount;
      
      return (
        <div key={resourceId} className={`text-xs ${hasEnough ? 'text-gray-600' : 'text-red-500'}`}>
          {formatNumber(amount)} {resourceName}
        </div>
      );
    });
  };
  
  return (
    <div className="building-card mb-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-medium">{building.name}</h3>
          <p className="text-xs text-gray-500">{building.description}</p>
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded text-xs">
          {building.count}
        </div>
      </div>
      
      {/* Эффекты здания */}
      <div className="mb-2">
        {renderEffects()}
        {renderConsumption()}
      </div>
      
      {/* Стоимость */}
      <div className="mb-3">
        <p className="text-xs text-gray-700 mb-1">Стоимость:</p>
        {renderCost()}
      </div>
      
      {/* Кнопка покупки */}
      <Button 
        onClick={handlePurchase} 
        disabled={!affordable}
        variant={affordable ? "default" : "outline"}
        size="sm"
        className="w-full text-xs"
      >
        Построить
      </Button>
    </div>
  );
};

export default BuildingCard;
