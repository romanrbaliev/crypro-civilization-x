
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upgrade } from "@/context/types";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";
import { formatEffect } from "@/utils/researchUtils";
import { getSpecializationName } from "@/utils/researchUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  ChevronRight
} from "lucide-react";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onPurchase?: () => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: upgrade.id } });
    if (onPurchase) onPurchase();
  };
  
  const canAfford = () => {
    for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(cost)) {
        return false;
      }
    }
    return true;
  };
  
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, cost]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const hasEnough = resource.value >= Number(cost);
      return (
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {resource.name}
          </span>
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {formatNumber(Number(cost))}
          </span>
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    if (!upgrade.effects && !upgrade.effect) return null;
    
    const effects = upgrade.effects || upgrade.effect;
    return Object.entries(effects).map(([effectId, amount]) => {
      // Форматируем эффект для более понятного отображения
      return (
        <div key={effectId} className="text-blue-600 text-[11px]">
          {formatEffect(effectId, Number(amount))}
        </div>
      );
    });
  };
  
  const renderSpecialization = () => {
    if (!upgrade.specialization) return null;
    
    return (
      <div className="mt-1 text-[11px] text-purple-600">
        Специализация: {getSpecializationName(upgrade.specialization)}
      </div>
    );
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
                {upgrade.name}
              </h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0">
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{upgrade.description}</p>
          
          {upgrade.purchased ? (
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium">Эффекты:</h4>
                {renderEffects()}
                {renderSpecialization()}
              </div>
              
              <div className="mt-2 p-1 bg-green-50 border border-green-200 rounded text-[11px] text-green-700 flex justify-center">
                Исследование завершено
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium">Стоимость:</h4>
                {renderCost()}
              </div>
              
              <div className="border-t pt-2 mt-2">
                <h4 className="text-[11px] font-medium mb-1">Эффекты:</h4>
                {renderEffects()}
                {renderSpecialization()}
              </div>
              
              <div className="border-t pt-2 mt-2">
                <Button
                  onClick={handlePurchase}
                  disabled={!canAfford()}
                  variant={canAfford() ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs"
                >
                  Исследовать
                </Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
