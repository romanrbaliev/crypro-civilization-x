
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
import { formatCost } from "@/utils/costFormatter";

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
  
  const canAfford = (): boolean => {
    if (!building.cost || Object.keys(building.cost).length === 0) {
      return false;
    }
    
    for (const [resourceId, amount] of Object.entries(building.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  const getResourceName = (resourceId: string): string => {
    const resourceNames: {[key: string]: string} = {
      knowledge: 'Знания',
      usdt: 'USDT',
      electricity: 'Электричество',
      computingPower: 'Вычисл. мощность',
      bitcoin: 'Bitcoin'
    };
    
    return resourceNames[resourceId] || 
           (state.resources[resourceId]?.name || resourceId);
  };
  
  const renderCost = () => {
    // Проверяем, существует ли building.cost
    if (!building.cost || Object.keys(building.cost).length === 0) {
      return <div className="text-red-500 text-[11px]">Стоимость не определена</div>;
    }
    
    return Object.entries(building.cost).map(([resourceId, amount]) => {
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
  
  const renderProduction = () => {
    if (!building.production || Object.keys(building.production).length === 0) {
      return null;
    }
    
    return Object.entries(building.production).map(([resourceId, amount]) => {
      const resourceName = getResourceName(resourceId);
      
      return (
        <div key={resourceId} className="text-green-600 text-[11px] flex justify-between w-full">
          <span>{resourceName}</span>
          <span>+{formatNumber(Number(amount))}/сек</span>
        </div>
      );
    });
  };
  
  const renderConsumption = () => {
    if (!building.consumption || Object.keys(building.consumption).length === 0) {
      return null;
    }
    
    return Object.entries(building.consumption).map(([resourceId, amount]) => {
      const resourceName = getResourceName(resourceId);
      
      return (
        <div key={resourceId} className="text-red-500 text-[11px] flex justify-between w-full">
          <span>{resourceName}</span>
          <span>-{formatNumber(Number(amount))}/сек</span>
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    if (!building.effects || Object.keys(building.effects).length === 0) {
      return null;
    }
    
    // Специальные случаи для отдельных зданий
    if (building.id === 'cryptoWallet') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Макс. USDT</span>
            <span>+50</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Макс. знаний</span>
            <span>+25%</span>
          </div>
        </>
      );
    } else if (building.id === 'internetChannel') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Прирост знаний</span>
            <span>+20%</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Эфф. вычислений</span>
            <span>+5%</span>
          </div>
        </>
      );
    } else if (building.id === 'enhancedWallet') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Макс. USDT</span>
            <span>+150</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Макс. BTC</span>
            <span>+1</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Эфф. обмена BTC</span>
            <span>+8%</span>
          </div>
        </>
      );
    } else if (building.id === 'cryptoLibrary') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Прирост знаний</span>
            <span>+50%</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>Макс. знаний</span>
            <span>+100</span>
          </div>
        </>
      );
    } else if (building.id === 'coolingSystem') {
      return (
        <div className="text-blue-600 text-[11px] flex justify-between w-full">
          <span>Потр. выч. мощности</span>
          <span>-20%</span>
        </div>
      );
    }
    
    // Обработка обычных эффектов
    return Object.entries(building.effects).map(([effectId, value]) => {
      // Форматируем название эффекта
      const effectName = formatEffectName(effectId);
      // Форматируем значение (добавляем знак + для положительных значений и % для процентов)
      const numValue = Number(value);
      const formattedValue = effectId.includes('Boost') || effectId.includes('Reduction') ? 
        `${numValue > 0 ? '+' : ''}${(numValue * 100).toFixed(0)}%` : 
        `${numValue > 0 ? '+' : ''}${formatNumber(numValue)}`;
      
      return (
        <div key={effectId} className="text-blue-600 text-[11px] flex justify-between w-full">
          <span>{effectName}</span>
          <span>{formattedValue}</span>
        </div>
      );
    });
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
                {building.name} {building.count > 0 && <span className="text-gray-500">×{building.count}</span>}
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
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium">Стоимость:</h4>
              {renderCost()}
            </div>
            
            {(renderProduction() || renderConsumption() || renderEffects()) && (
              <div className="border-t pt-2 mt-2">
                {renderProduction() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1">Производит:</h4>
                    {renderProduction()}
                  </>
                )}
                
                {renderConsumption() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">Потребляет:</h4>
                    {renderConsumption()}
                  </>
                )}
                
                {renderEffects() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">Эффекты:</h4>
                    {renderEffects()}
                  </>
                )}
              </div>
            )}
            
            <div className="border-t pt-2 grid grid-cols-2 gap-2 mt-2">
              <Button
                onClick={handlePurchase}
                disabled={!canAfford()}
                variant={canAfford() ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                Купить
              </Button>
              
              <Button
                onClick={handleSell}
                disabled={building.count <= 0}
                variant="outline"
                size="sm"
                className="text-xs"
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
