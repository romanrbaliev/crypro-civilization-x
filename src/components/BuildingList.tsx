
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BuildingList: React.FC = () => {
  const { state, dispatch } = useGame();
  const [expandedBuildings, setExpandedBuildings] = React.useState<Set<string>>(new Set());
  
  // Фильтруем только разблокированные здания
  const unlockedBuildings = Object.values(state.buildings).filter(building => building.unlocked);
  
  const toggleBuilding = (buildingId: string) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingId)) {
      newExpanded.delete(buildingId);
    } else {
      newExpanded.add(buildingId);
    }
    setExpandedBuildings(newExpanded);
  };
  
  const purchaseBuilding = (buildingId: string) => {
    dispatch({
      type: 'PURCHASE_BUILDING',
      payload: { buildingId }
    });
  };
  
  const sellBuilding = (buildingId: string) => {
    dispatch({
      type: 'SELL_BUILDING',
      payload: { buildingId }
    });
  };
  
  // Проверяем, достаточно ли ресурсов для покупки здания
  const canAfford = (building: any) => {
    for (const [resourceId, cost] of Object.entries(building.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < cost) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <div className="space-y-4">
      {unlockedBuildings.map(building => {
        const isExpanded = expandedBuildings.has(building.id);
        const affordable = canAfford(building);
        
        return (
          <div key={building.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleBuilding(building.id)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium">{building.name}</span>
                  {building.count > 0 && (
                    <span className="ml-2 text-gray-500">×{building.count}</span>
                  )}
                </div>
              </div>
              <div className="text-gray-500">
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400 mb-4">{building.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Стоимость:</span>
                    <span className={affordable ? 'text-gray-900 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}>
                      {Object.entries(building.cost).map(([resourceId, cost]) => (
                        <span key={resourceId} className="ml-2">
                          {formatNumber(cost as number, 0)} {state.resources[resourceId]?.name}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                
                {Object.entries(building.production || {}).length > 0 && (
                  <div className="mb-4">
                    <div className="text-gray-700 dark:text-gray-300 mb-1">Производит:</div>
                    {Object.entries(building.production || {}).map(([resourceId, amount]) => (
                      <div key={resourceId} className="flex justify-between items-center">
                        <span className="text-green-600 dark:text-green-400">{state.resources[resourceId]?.name}</span>
                        <span className="text-green-600 dark:text-green-400">+{amount}/сек</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {Object.entries(building.consumption || {}).length > 0 && (
                  <div className="mb-4">
                    <div className="text-gray-700 dark:text-gray-300 mb-1">Потребляет:</div>
                    {Object.entries(building.consumption || {}).map(([resourceId, amount]) => (
                      <div key={resourceId} className="flex justify-between items-center">
                        <span className="text-red-600 dark:text-red-400">{state.resources[resourceId]?.name}</span>
                        <span className="text-red-600 dark:text-red-400">-{amount}/сек</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => purchaseBuilding(building.id)}
                    disabled={!affordable}
                  >
                    Купить
                  </Button>
                  
                  {building.count > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => sellBuilding(building.id)}
                    >
                      Продать
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BuildingList;
