
import React from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/helpers";
import { useGame, Building } from "@/context/GameContext";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface BuildingItemProps {
  building: Building;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onPurchase }) => {
  const { state, dispatch } = useGame();
  const { id, name, description, cost, costMultiplier, production, count } = building;
  
  const handlePurchase = () => {
    console.log(`Попытка покупки здания ${id} через компонент BuildingItem`);
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: id } });
    if (onPurchase) onPurchase();
  };
  
  // Проверка, достаточно ли ресурсов для покупки
  const canAfford = () => {
    for (const [resourceId, baseCost] of Object.entries(cost)) {
      const actualCost = Number(baseCost) * Math.pow(Number(costMultiplier), count);
      if (!state.resources[resourceId] || state.resources[resourceId].value < actualCost) {
        return false;
      }
    }
    return true;
  };
  
  // Форматирование списка затрат
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, baseCost]) => {
      const resource = state.resources[resourceId];
      const actualCost = Number(baseCost) * Math.pow(Number(costMultiplier), count);
      const hasEnough = resource && resource.value >= actualCost;
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[10px]`}>
          {formatNumber(actualCost)} {resource ? resource.name : resourceId}
        </div>
      );
    });
  };
  
  // Форматирование списка производства
  const renderProduction = () => {
    return Object.entries(production).map(([resourceId, amount]) => {
      // Для специальных модификаторов (бонусы, максимумы и т.д.)
      if (resourceId.includes('Boost')) {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={resourceId} className="text-green-600 text-[10px]">
            +{boostPercent}% к производству
          </div>
        );
      } else if (resourceId.includes('Max')) {
        const actualResourceId = resourceId.replace('Max', '');
        const resource = state.resources[actualResourceId];
        if (resource) {
          return (
            <div key={resourceId} className="text-blue-600 text-[10px]">
              +{formatNumber(Number(amount))} к максимуму {resource.name}
            </div>
          );
        }
        return null;
      }
      
      // Для обычных ресурсов
      const resource = state.resources[resourceId];
      if (resource) {
        return (
          <div key={resourceId} className="text-green-600 text-[10px]">
            +{formatNumber(Number(amount))}/сек {resource.name}
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };
  
  return (
    <div className="p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-2">
      <div className="building-header">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[12px]">{name}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handlePurchase} 
                  disabled={!canAfford()}
                  variant={canAfford() ? "default" : "outline"}
                  size="sm"
                  className="text-[10px] h-7 px-2"
                >
                  Построить
                </Button>
              </TooltipTrigger>
              {!canAfford() && (
                <TooltipContent side="left">
                  <p className="text-[10px]">Недостаточно ресурсов</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-[12px] font-medium">{count}</div>
      </div>
      
      <div className="building-details">
        <p className="text-[10px] text-gray-600 mb-1 w-full">{description}</p>
        <div className="flex flex-col gap-1 text-[10px] w-full">
          {renderCost()}
        </div>
        <div className="mt-1 text-[10px] w-full">
          {renderProduction()}
        </div>
      </div>
    </div>
  );
};

export default BuildingItem;
