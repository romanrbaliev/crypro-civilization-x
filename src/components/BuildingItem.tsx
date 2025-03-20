
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
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface BuildingItemProps {
  building: Building;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(true);
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: building.id } });
    if (onPurchase) onPurchase();
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
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[10px]`}>
          {formatNumber(amount)} {resource.name}
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
        // Fix: The formatEffectName function only takes one parameter (effectId), not two
        const formattedEffect = formatEffectName(resourceId);
        return (
          <div key={resourceId} className="text-blue-600 text-[10px]">
            +{amount} {formattedEffect}
          </div>
        );
      }
      
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-green-600 text-[10px]">
          +{amount}/сек {resource.name}
        </div>
      );
    });
  };
  
  // Добавляем отображение потребления ресурсов
  const renderConsumption = () => {
    if (!building.consumption || Object.keys(building.consumption).length === 0) {
      return null;
    }
    
    return Object.entries(building.consumption).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      return (
        <div key={resourceId} className="text-red-500 text-[10px]">
          -{amount}/сек {resource.name}
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
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[10px]`}>
          {formatNumber(Number(amount))} {resource.name}
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
      className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-2"
    >
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-sm font-medium">{building.name}</h3>
              <div className="flex items-center space-x-2">
                {building.count > 0 && (
                  <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {building.count}
                  </span>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{building.description}</p>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-medium">Производство:</h4>
                {renderProduction()}
                {renderConsumption()}
              </div>
              
              <div className="space-y-1 text-right">
                <h4 className="text-xs font-medium">Стоимость:</h4>
                {building.count === 0 ? renderCost() : renderNextCost()}
              </div>
            </div>
            
            <div className="mt-2 flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handlePurchase}
                        disabled={!canAfford() || hasReachedMaxCount()}
                        variant={canAfford() && !hasReachedMaxCount() ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {building.count === 0 ? "Купить" : "Улучшить"}
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
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default BuildingItem;
