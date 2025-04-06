
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
import { useTranslation } from "@/i18n";

interface BuildingItemProps {
  building: Building;
  onPurchase?: () => void;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useTranslation();
  
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
  
  // Получение переведенного названия ресурса
  const getResourceName = (resourceId: string): string => {
    const translationKeys: {[key: string]: string} = {
      knowledge: 'resources.knowledge',
      usdt: 'resources.usdt',
      electricity: 'resources.electricity',
      computingPower: 'resources.computingPower',
      bitcoin: 'resources.bitcoin'
    };
    
    const translationKey = translationKeys[resourceId];
    if (translationKey) {
      return t(translationKey);
    }
    
    return state.resources[resourceId]?.name || resourceId;
  };
  
  const renderCost = () => {
    if (!building.cost || Object.keys(building.cost).length === 0) {
      return <div className="text-red-500 text-[11px]">{t('buildings.cost')} {t('buildings.undefined')}</div>;
    }
    
    return Object.entries(building.cost).map(([resourceId, amount]) => {
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
          <span>+{formatNumber(Number(amount))}/{t('resources.perSecond')}</span>
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
          <span>-{formatNumber(Number(amount))}/{t('resources.perSecond')}</span>
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    if (!building.effects || Object.keys(building.effects).length === 0) {
      return null;
    }
    
    // Для каждого здания определяем набор эффектов с учетом перевода
    if (building.id === 'cryptoWallet') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.cryptoWallet.effect1').split(':')[0]}</span>
            <span>+50</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.cryptoWallet.effect2').split(':')[0]}</span>
            <span>+25%</span>
          </div>
        </>
      );
    } else if (building.id === 'internetChannel') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.internetChannel.effect1').split(':')[0]}</span>
            <span>+20%</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.internetChannel.effect2').split(':')[0]}</span>
            <span>+5%</span>
          </div>
        </>
      );
    } else if (building.id === 'enhancedWallet' || building.id === 'improvedWallet') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.improvedWallet.effect1').split(':')[0]}</span>
            <span>+150</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.improvedWallet.effect2').split(':')[0]}</span>
            <span>+1</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.improvedWallet.effect3').split(':')[0]}</span>
            <span>+8%</span>
          </div>
        </>
      );
    } else if (building.id === 'cryptoLibrary') {
      return (
        <>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.cryptoLibrary.effect1').split(':')[0]}</span>
            <span>+50%</span>
          </div>
          <div className="text-blue-600 text-[11px] flex justify-between w-full">
            <span>{t('buildings.cryptoLibrary.effect2').split(':')[0]}</span>
            <span>+100</span>
          </div>
        </>
      );
    } else if (building.id === 'coolingSystem') {
      return (
        <div className="text-blue-600 text-[11px] flex justify-between w-full">
          <span>{t('buildings.coolingSystem.effect').split(':')[0]}</span>
          <span>-20%</span>
        </div>
      );
    }
    
    return Object.entries(building.effects).map(([effectId, value]) => {
      const effectName = formatEffectName(effectId);
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
  
  // Получение переведенного названия и описания здания
  const getBuildingName = () => {
    const translationKey = `buildings.${building.id}`;
    return t(translationKey) !== translationKey ? t(translationKey) : building.name;
  };
  
  const getBuildingDescription = () => {
    const translationKey = `buildings.${building.id}.description`;
    return t(translationKey) !== translationKey ? t(translationKey) : building.description;
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
                {getBuildingName()} {building.count > 0 && <span className="text-gray-500">×{building.count}</span>}
              </h3>
            </div>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 pt-0">
          <p className="text-[11px] text-gray-500 mt-1 mb-2">{getBuildingDescription()}</p>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium">{t('buildings.cost')}:</h4>
              {renderCost()}
            </div>
            
            {(renderProduction() || renderConsumption() || renderEffects()) && (
              <div className="border-t pt-2 mt-2">
                {renderProduction() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1">{t('buildings.produces')}:</h4>
                    {renderProduction()}
                  </>
                )}
                
                {renderConsumption() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">{t('buildings.consumes')}:</h4>
                    {renderConsumption()}
                  </>
                )}
                
                {renderEffects() && (
                  <>
                    <h4 className="text-[11px] font-medium mb-1 mt-1">{t('buildings.effects')}:</h4>
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
                {t('buildings.buy')}
              </Button>
              
              <Button
                onClick={handleSell}
                disabled={building.count <= 0}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {t('buildings.sell')}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default BuildingItem;
