
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building } from "@/context/types";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { formatEffectName } from "@/utils/researchUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  ChevronRight
} from "lucide-react";

interface BuildingItemProps {
  building: Building;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: building.id } });
    if (onPurchase) onPurchase();
  };
  
  const handleSell = () => {
    if (building.count > 0) {
      dispatch({ type: "SELL_BUILDING", payload: { buildingId: building.id } });
    }
  };
  
  const canAfford = () => {
    for (const [resourceId, amount] of Object.entries(building.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < amount) {
        return false;
      }
    }
    return true;
  };
  
  const renderCost = () => {
    return Object.entries(building.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const hasEnough = resource.value >= amount;
      return (
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {resource.name}
          </span>
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {formatNumber(amount)}
          </span>
        </div>
      );
    });
  };
  
  const renderProduction = () => {
    if (!building.production || Object.keys(building.production).length === 0) {
      return null;
    }
    
    return Object.entries(building.production).map(([resourceId, amount]) => {
      if (resourceId.includes('Max') || resourceId.includes('Boost')) {
        const formattedEffect = formatEffectName(resourceId);
        return (
          <div key={resourceId} className="text-blue-600 text-[11px]">
            {formattedEffect}: {amount}
          </div>
        );
      }
      
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-green-600 text-[11px]">
          {resource.name}: +{amount}/сек
        </div>
      );
    });
  };
  
  const renderConsumption = () => {
    if (!building.consumption || Object.keys(building.consumption).length === 0) {
      return null;
    }
    
    return Object.entries(building.consumption).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-red-500 text-[11px]">
          {resource.name}: -{amount}/сек
        </div>
      );
    });
  };
  
  const getNextCost = () => {
    const nextCost = {};
    for (const [resourceId, amount] of Object.entries(building.cost)) {
      nextCost[resourceId] = Math.floor(amount * Math.pow(building.costMultiplier || 1.15, building.count));
    }
    return nextCost;
  };
  
  const renderNextCost = () => {
    const nextCost = getNextCost();
    return Object.entries(nextCost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const hasEnough = resource.value >= Number(amount);
      return (
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {resource.name}
          </span>
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {formatNumber(Number(amount))}
          </span>
        </div>
      );
    });
  };
  
  const hasReachedMaxCount = () => {
    if (building.maxCount === undefined) return false;
    return building.count >= building.maxCount;
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border rounded-lg ${canAfford() ? 'bg-white' : 'bg-gray-100'} shadow-sm mb-2 overflow-hidden`}
    >
      <CollapsibleTrigger asChild>
        <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xs font-medium">
                {building.name} {building.count > 0 && `(${building.count})`}
              </h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0">
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{building.description}</p>
          
          <div className="space-y-2">
            {building.count === 0 ? (
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium">Стоимость:</h4>
                {renderCost()}
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium">Стоимость улучшения:</h4>
                {renderNextCost()}
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <h4 className="text-[11px] font-medium mb-1">Эффекты:</h4>
              {renderProduction()}
              {renderConsumption()}
            </div>
            
            <div className="border-t pt-2 grid grid-cols-2 gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handlePurchase}
                        disabled={!canAfford() || hasReachedMaxCount()}
                        variant={canAfford() && !hasReachedMaxCount() ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs"
                      >
                        {building.count === 0 ? "Построить" : "Улучшить"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(!canAfford() || hasReachedMaxCount()) && (
                    <TooltipContent>
                      <p className="text-xs">
                        {hasReachedMaxCount() 
                          ? "Достигнуто максимальное количество" 
                          : "Недостаточно ресурсов"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              <Button
                onClick={handleSell}
                disabled={building.count === 0}
                variant="outline"
                size="sm"
                className="text-xs w-full"
              >
                Продать
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BuildingItem;
