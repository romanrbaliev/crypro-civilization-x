
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
      if (!resource || resource.value < Number(cost)) {
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
          <div key={building.id} className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
            <div 
              className="p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleBuilding(building.id)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">{building.name}</span>
                  {building.count > 0 && (
                    <span className="ml-2 text-gray-500 text-xs">×{building.count}</span>
                  )}
                </div>
              </div>
              <div className="text-gray-500">
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-3 border-t bg-white dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs">{building.description}</p>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">Стоимость:</div>
                  <div className="space-y-1">
                    {Object.entries(building.cost).map(([resourceId, cost]) => (
                      <div key={resourceId} className="flex justify-between">
                        <span className="text-xs">{state.resources[resourceId]?.name}</span>
                        <span className={affordable ? 'text-xs' : 'text-xs text-red-500'}>
                          {formatNumber(Number(cost), 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {Object.entries(building.production || {}).length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">Производит:</div>
                    {Object.entries(building.production || {}).map(([resourceId, amount]) => (
                      <div key={resourceId} className="flex justify-between items-center">
                        <span className="text-xs text-green-600 dark:text-green-400">{state.resources[resourceId]?.name}</span>
                        <span className="text-xs text-green-600 dark:text-green-400">+{amount}/сек</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {Object.entries(building.consumption || {}).length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-700 dark:text-gray-300 mb-1">Потребляет:</div>
                    {Object.entries(building.consumption || {}).map(([resourceId, amount]) => (
                      <div key={resourceId} className="flex justify-between items-center">
                        <span className="text-xs text-red-500 dark:text-red-400">{state.resources[resourceId]?.name}</span>
                        <span className="text-xs text-red-500 dark:text-red-400">-{amount}/сек</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="default"
                    className="text-xs"
                    onClick={() => purchaseBuilding(building.id)}
                    disabled={!affordable}
                  >
                    Купить
                  </Button>
                  
                  {building.count > 0 && (
                    <Button
                      variant="outline"
                      className="text-xs"
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
