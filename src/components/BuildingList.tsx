
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const BuildingList: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Фильтруем разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(
    building => building.unlocked
  );
  
  // Состояние для открытых/закрытых карточек
  const [expandedBuildings, setExpandedBuildings] = React.useState<{[key: string]: boolean}>({});
  
  // Переключение состояния карточки
  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings(prev => ({
      ...prev,
      [buildingId]: !prev[buildingId]
    }));
  };
  
  // Покупка здания
  const handleBuyBuilding = (buildingId: string) => {
    dispatch({ type: 'PURCHASE_BUILDING', payload: { buildingId } });
  };
  
  // Продажа здания
  const handleSellBuilding = (buildingId: string) => {
    dispatch({ type: 'SELL_BUILDING', payload: { buildingId } });
  };
  
  // Проверка, может ли игрок купить здание
  const canAffordBuilding = (building: any) => {
    return Object.entries(building.cost).every(([resourceId, cost]) => {
      const resource = state.resources[resourceId];
      const scaledCost = Number(cost) * Math.pow(building.costMultiplier, building.count);
      return resource && resource.value >= scaledCost;
    });
  };
  
  // Получение стоимости здания с учетом коэффициента
  const getBuildingCost = (building: any) => {
    return Object.entries(building.cost).map(([resourceId, baseCost]) => {
      const cost = Number(baseCost) * Math.pow(building.costMultiplier, building.count);
      const resource = state.resources[resourceId];
      const canAfford = resource && resource.value >= cost;
      
      return (
        <div key={resourceId} className="flex justify-between items-center">
          <span className="text-gray-600">{state.resources[resourceId]?.name}:</span>
          <span className={canAfford ? "text-gray-600" : "text-red-500"}>
            {formatNumber(cost, 0)}
          </span>
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-4">
      {unlockedBuildings.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          Нет доступных зданий
        </div>
      ) : (
        unlockedBuildings.map(building => {
          const isExpanded = expandedBuildings[building.id] ?? false;
          
          return (
            <div 
              key={building.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Заголовок карточки */}
              <div 
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleBuilding(building.id)}
              >
                <div className="flex items-center">
                  <h3 className="font-medium">
                    {building.name} {building.count > 0 && <span className="text-gray-500">×{building.count}</span>}
                  </h3>
                </div>
                <div>
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </div>
              
              {/* Развернутая информация */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-4">{building.description}</p>
                  
                  {/* Стоимость */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Стоимость:</h4>
                    {getBuildingCost(building)}
                  </div>
                  
                  {/* Производство */}
                  {building.production && Object.keys(building.production).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Производит:</h4>
                      {Object.entries(building.production).map(([resourceId, amount]) => (
                        <div key={resourceId} className="flex justify-between items-center">
                          <span className="text-gray-600">{state.resources[resourceId]?.name}</span>
                          <span className="text-green-500">+{amount}/сек</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Потребление */}
                  {building.consumption && Object.keys(building.consumption).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Потребляет:</h4>
                      {Object.entries(building.consumption).map(([resourceId, amount]) => (
                        <div key={resourceId} className="flex justify-between items-center">
                          <span className="text-gray-600">{state.resources[resourceId]?.name}</span>
                          <span className="text-red-500">-{amount}/сек</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Кнопки действий */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      onClick={() => handleBuyBuilding(building.id)}
                      disabled={!canAffordBuilding(building)}
                      className="w-full"
                      variant="outline"
                    >
                      Купить
                    </Button>
                    
                    <Button
                      onClick={() => handleSellBuilding(building.id)}
                      disabled={building.count <= 0}
                      className="w-full"
                      variant="outline"
                    >
                      Продать
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default BuildingList;
