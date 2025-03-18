
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/helpers";
import { useGame } from "@/context/hooks/useGame";
import { Upgrade } from "@/context/types";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onPurchase?: () => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase }) => {
  const { state, dispatch } = useGame();
  const { id, name, description, cost, effect, purchased } = upgrade;
  const [isOpen, setIsOpen] = useState(!purchased); // По умолчанию открыты только неприобретенные
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: id } });
    setIsOpen(false); // Сворачиваем карточку после покупки
    if (onPurchase) onPurchase();
  };
  
  const canAfford = () => {
    for (const [resourceId, amount] of Object.entries(cost)) {
      if (state.resources[resourceId].value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource.value >= Number(amount);
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[10px] w-full`}>
          {formatNumber(Number(amount))} {resource.name}
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    return Object.entries(effect).map(([effectId, amount]) => {
      if (effectId === 'knowledgeBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{boostPercent}% к скорости накопления Знаний о крипте
          </div>
        );
      } else if (effectId === 'knowledgeMaxBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{boostPercent}% к максимуму Знаний о крипте
          </div>
        );
      } else if (effectId === 'usdtMaxBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{boostPercent}% к максимуму USDT
          </div>
        );
      } else if (effectId.includes('Boost')) {
        const resourceId = effectId.replace('Boost', '');
        const boostPercent = Number(amount) * 100;
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{boostPercent}% к скорости накопления {resourceName}
          </div>
        );
      } else if (effectId.includes('Max')) {
        const resourceId = effectId.replace('Max', '');
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{formatNumber(Number(amount))} к максимуму {resourceName}
          </div>
        );
      } else if (effectId === 'conversionRate') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[10px] w-full">
            +{boostPercent}% к конверсии
          </div>
        );
      }
      
      return (
        <div key={effectId} className="text-blue-600 text-[10px] w-full">
          +{amount} к {effectId}
        </div>
      );
    });
  };
  
  if (purchased) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="p-2 border rounded-lg bg-gray-50 shadow-sm mb-2"
      >
        <div className="flex justify-between items-center w-full">
          <h3 className="font-semibold text-[12px] flex items-center">
            {name} <Sparkles className="ml-1 h-3 w-3 text-amber-500" />
          </h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6 min-w-6">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="mt-2">
            <p className="text-[10px] text-gray-600 mb-1 w-full">{description}</p>
            <div className="mt-1 text-[10px] w-full">
              {renderEffects()}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-2"
    >
      <div className="flex justify-between items-start w-full">
        <div className="w-full pr-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-semibold text-[12px]">{name}</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6 min-w-6 ml-auto">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="mt-1">
          <p className="text-[10px] text-gray-600 mb-1 w-full">{description}</p>
          <div className="flex flex-col gap-1 w-full">
            {renderCost()}
          </div>
          <div className="mt-1 w-full">
            {renderEffects()}
          </div>
          
          <div className="mt-2 flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handlePurchase} 
                    disabled={!canAfford()}
                    variant={canAfford() ? "default" : "outline"}
                    size="sm"
                    className="text-[10px] h-7 px-2 whitespace-nowrap"
                  >
                    Исследовать
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
