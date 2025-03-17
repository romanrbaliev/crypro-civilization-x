
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/helpers";
import { useGame } from "@/context/hooks/useGame";
import { Building } from "@/context/types";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface BuildingItemProps {
  building: Building;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onPurchase }) => {
  const { state, dispatch } = useGame();
  const { id, name, description, cost, costMultiplier, production, count } = building;
  // Состояние карточки - открыта или закрыта
  const [isOpen, setIsOpen] = useState(count === 0);
  
  const handlePurchase = () => {
    console.log(`Попытка покупки здания ${id} через компонент BuildingItem`);
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: id } });
    
    // После первой покупки оставляем карточку открытой, чтобы пользователь видел новую информацию
    if (onPurchase) onPurchase();
  };
  
  const canAfford = () => {
    for (const [resourceId, baseCost] of Object.entries(cost)) {
      const actualCost = Number(baseCost) * Math.pow(Number(costMultiplier), count);
      if (!state.resources[resourceId] || state.resources[resourceId].value < actualCost) {
        return false;
      }
    }
    return true;
  };
  
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, baseCost]) => {
      const resource = state.resources[resourceId];
      const actualCost = Number(baseCost) * Math.pow(Number(costMultiplier), count);
      const hasEnough = resource && resource.value >= actualCost;
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[10px]`}>
          {actualCost % 1 === 0 ? formatNumber(actualCost) : actualCost.toFixed(2)} {resource ? resource.name : resourceId}
        </div>
      );
    });
  };
  
  const renderProduction = () => {
    const productionItems = [];
    
    if (id === "homeComputer") {
      productionItems.push(
        <div key="consumption" className="text-red-600 text-[10px]">
          -0.5 электричество/сек
        </div>
      );
    }
    
    Object.entries(production).forEach(([resourceId, amount]) => {
      if (resourceId.includes('Boost')) {
        const boostPercent = Number(amount) * 100;
        const baseResourceId = resourceId.replace('Boost', '');
        const resourceName = state.resources[baseResourceId]?.name || baseResourceId;
        productionItems.push(
          <div key={resourceId} className="text-green-600 text-[10px]">
            +{boostPercent % 1 === 0 ? boostPercent : boostPercent.toFixed(2)}% к скорости накопления {resourceName}
          </div>
        );
      } else if (resourceId.includes('Max')) {
        const actualResourceId = resourceId.replace('Max', '');
        const resource = state.resources[actualResourceId];
        if (resource) {
          productionItems.push(
            <div key={resourceId} className="text-blue-600 text-[10px]">
              +{Number(amount) % 1 === 0 ? formatNumber(Number(amount)) : Number(amount).toFixed(2)} к максимуму {resource.name}
            </div>
          );
        }
      } else {
        const resource = state.resources[resourceId];
        if (resource) {
          productionItems.push(
            <div key={resourceId} className="text-green-600 text-[10px]">
              +{Number(amount) % 1 === 0 ? formatNumber(Number(amount)) : Number(amount).toFixed(2)}/сек {resource.name}
            </div>
          );
        }
      }
    });
    
    return productionItems;
  };
  
  // Если здание уже куплено хотя бы 1 раз, оно может сворачиваться
  if (count > 0) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-2"
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <h3 className="font-semibold text-[12px]">{name}</h3>
          </div>
          <div className="flex items-center">
            <div className="mr-2 text-[12px] font-medium">{count}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handlePurchase} 
                    disabled={!canAfford()}
                    variant={canAfford() ? "default" : "outline"}
                    size="sm"
                    className="text-[10px] h-7 px-2 mr-4"
                  >
                    Улучшить
                  </Button>
                </TooltipTrigger>
                {!canAfford() && (
                  <TooltipContent side="left">
                    <p className="text-[10px]">Недостаточно ресурсов</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-5 w-5 rounded-full">
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="building-details mt-1">
            <p className="text-[10px] text-gray-600 mb-1 w-full">{description}</p>
            <div className="flex flex-col gap-1 text-[10px] w-full">
              {renderCost()}
            </div>
            <div className="mt-1 text-[10px] w-full">
              {renderProduction()}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  // Новые здания показываются полностью развернутыми
  return (
    <div className="p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-2">
      <div className="building-header flex justify-between items-center">
        <div className="flex items-start flex-col">
          <h3 className="font-semibold text-[12px]">{name}</h3>
          {/* Убираем отображение "0" для еще не купленных зданий */}
        </div>
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
      
      <div className="building-details mt-1">
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
