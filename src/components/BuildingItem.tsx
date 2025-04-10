import React, { useState } from "react";
import { Building as BuildingIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Building } from "@/context/types";
import { useGame } from "@/context/hooks/useGame";
import { formatNumber } from "@/utils/helpers";
import { canAffordBuilding } from "@/utils/buildingUtils";
import { t } from "@/localization";

export interface BuildingItemProps {
  building: Building;
  onAddEvent?: (message: string, type: string) => void;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onAddEvent, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: building.id } });
    if (onAddEvent) onAddEvent(t("ui.actions.buy"), "success");
    if (onPurchase) onPurchase();
  };
  
  const handleSell = () => {
    if (building.count > 0) {
      dispatch({ type: "SELL_BUILDING", payload: { buildingId: building.id } });
    }
  };
  
  const canAfford = (): boolean => {
    const nextCost = getNextCost();
    for (const [resourceId, amount] of Object.entries(nextCost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  const getNextCost = () => {
    const nextCost = {};
    for (const [resourceId, baseAmount] of Object.entries(building.cost)) {
      const multiplier = building.costMultiplier || 1.15;
      const calculatedCost = Math.floor(Number(baseAmount) * Math.pow(multiplier, building.count));
      nextCost[resourceId] = calculatedCost;
    }
    return nextCost;
  };
  
  const getResourceName = (resourceId: string): string => {
    return t(`resources.${resourceId}.name`);
  };
  
  const renderCost = () => {
    const costs = building.count === 0 ? building.cost : getNextCost();
    return Object.entries(costs).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const hasEnough = resource.value >= Number(amount);
      return (
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {getResourceName(resourceId)}
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
          <span>+{formatNumber(Number(amount))}/{t("common.perSecond")}</span>
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
          <span>-{formatNumber(Number(amount))}/{t("common.perSecond")}</span>
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    if (!building.effects || Object.keys(building.effects).length === 0) {
      return null;
    }
    
    switch (building.id) {
      case 'cryptoWallet':
        return (
          <>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.cryptoWallet.effect1").split("+")[0]}</span>
              <span>+{t("buildings.cryptoWallet.effect1").split("+")[1]}</span>
            </div>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.cryptoWallet.effect2").split("+")[0]}</span>
              <span>+{t("buildings.cryptoWallet.effect2").split("+")[1]}</span>
            </div>
          </>
        );
      case 'internetChannel':
        return (
          <>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.internetChannel.effect1").split("+")[0]}</span>
              <span>+{t("buildings.internetChannel.effect1").split("+")[1]}</span>
            </div>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.internetChannel.effect2").split("+")[0]}</span>
              <span>+{t("buildings.internetChannel.effect2").split("+")[1]}</span>
            </div>
          </>
        );
      case 'coolingSystem':
        return (
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t("buildings.coolingSystem.effect").split("-")[0]}</span>
            <span>-{t("buildings.coolingSystem.effect").split("-")[1]}</span>
          </div>
        );
      case 'enhancedWallet':
        return (
          <>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.enhancedWallet.effect1").split("+")[0]}</span>
              <span>+{t("buildings.enhancedWallet.effect1").split("+")[1]}</span>
            </div>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.enhancedWallet.effect2").split("+")[0]}</span>
              <span>+{t("buildings.enhancedWallet.effect2").split("+")[1]}</span>
            </div>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.enhancedWallet.effect3").split("+")[0]}</span>
              <span>+{t("buildings.enhancedWallet.effect3").split("+")[1]}</span>
            </div>
          </>
        );
      case 'cryptoLibrary':
        return (
          <>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.cryptoLibrary.effect1").split("+")[0]}</span>
              <span>+{t("buildings.cryptoLibrary.effect1").split("+")[1]}</span>
            </div>
            <div className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{t("buildings.cryptoLibrary.effect2").split("+")[0]}</span>
              <span>+{t("buildings.cryptoLibrary.effect2").split("+")[1]}</span>
            </div>
          </>
        );
      default:
        return Object.entries(building.effects).map(([effectId, value]) => {
          let effectName = effectId;
          let formattedValue = '';
          
          if (effectId.includes('Boost') || effectId.includes('boost')) {
            effectName = effectId.replace(/Boost|boost/, ' бонус');
            formattedValue = `+${(Number(value) * 100).toFixed(0)}%`;
          } else if (effectId.includes('Max') || effectId.includes('max')) {
            effectName = effectId.replace(/Max|max/, ' максимум');
            formattedValue = `+${formatNumber(Number(value))}`;
          } else {
            formattedValue = `${Number(value) > 0 ? '+' : ''}${formatNumber(Number(value))}`;
          }
          
          return (
            <div key={effectId} className="text-blue-600 text-[11px] flex justify-between w-full">
              <span>{effectName}</span>
              <span>{formattedValue}</span>
            </div>
          );
        });
    }
  };
  
  const name = t(`buildings.${building.id}.name`);
  const description = t(`buildings.${building.id}.description`);
  
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
                {name} {building.count > 0 && <span className="text-gray-500">×{building.count}</span>}
              </h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0">
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{description}</p>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium">{t("ui.states.sections.cost")}</h4>
              {renderCost()}
            </div>
            
            {(renderProduction() || renderConsumption() || renderEffects()) && (
              <div className="border-t pt-2 mt-2">
                {renderProduction() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1">{t("ui.states.sections.produces")}</h4>
                    {renderProduction()}
                  </>
                )}
                
                {renderConsumption() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">{t("ui.states.sections.consumes")}</h4>
                    {renderConsumption()}
                  </>
                )}
                
                {renderEffects() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">{t("ui.states.sections.effects")}</h4>
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
                {t("ui.actions.buy")}
              </Button>
              
              <Button
                onClick={handleSell}
                disabled={building.count <= 0}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {t("ui.actions.sell")}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BuildingItem;
