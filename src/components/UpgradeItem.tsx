
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upgrade } from "@/context/types";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { formatEffectName, formatEffectValue } from "@/utils/researchUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onPurchase?: () => void;
  onAddEvent?: (message: string, type: string) => void; // Добавляем опциональный пропс
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: upgrade.id } });
    if (onPurchase) onPurchase();
    // Добавляем событие в журнал, если передан обработчик
    if (onAddEvent) onAddEvent(`Исследование "${upgrade.name}" завершено`, "success");
  };
  
  const canAfford = (): boolean => {
    for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
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
  
  const renderEffects = () => {
    // Используем эффекты из разных источников
    const effects = upgrade.effects || upgrade.effect || {};
    if (!effects || Object.keys(effects).length === 0) {
      return <div className="text-gray-500 text-[11px]">Нет эффектов</div>;
    }
    
    return Object.entries(effects).map(([effectId, value]) => {
      // Используем специальные функции форматирования для каждого эффекта
      const effectName = formatEffectName(effectId);
      const formattedValue = formatEffectValue(Number(value), effectId);
      
      return (
        <div key={effectId} className="text-blue-600 text-[11px]">
          {effectName}: {formattedValue}
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
                {upgrade.name} {upgrade.purchased && '✓'}
              </h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0">
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{upgrade.description}</p>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium">Стоимость:</h4>
              {renderCost()}
            </div>
            
            <div className="border-t pt-2 mt-2">
              <h4 className="text-[11px] font-medium mb-1">Эффекты:</h4>
              {renderEffects()}
            </div>
            
            <div className="border-t pt-2 grid grid-cols-1 gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handlePurchase}
                        disabled={!canAfford() || upgrade.purchased}
                        variant={canAfford() && !upgrade.purchased ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs"
                      >
                        {upgrade.purchased ? "Исследовано" : "Исследовать"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {(!canAfford() || upgrade.purchased) && (
                    <TooltipContent>
                      <p className="text-xs">
                        {upgrade.purchased
                          ? "Исследование уже проведено"
                          : "Недостаточно ресурсов"}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
