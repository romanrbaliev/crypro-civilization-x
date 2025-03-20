
import React, { useState, useEffect } from "react";
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
  ChevronRight
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
  const { id, name, description, cost, effects, purchased } = upgrade;
  // Безопасно получаем объект эффектов с проверкой на null/undefined
  const effectData = effects || upgrade.effect || {};
  const [isOpen, setIsOpen] = useState(false);
  
  // Проверка, является ли это исследование "Основы блокчейна"
  const isBlockchainBasics = id === 'blockchainBasics' || id === 'basicBlockchain' || id === 'blockchain_basics';
  
  // Отслеживаем покупку "Основ блокчейна" для активации реферала
  useEffect(() => {
    if (purchased && isBlockchainBasics && state.referredBy) {
      console.log('Исследование "Основы блокчейна" куплено, активируем реферала');
      const userId = localStorage.getItem('userId');
      if (userId) {
        dispatch({ type: "ACTIVATE_REFERRAL", payload: { referralId: userId } });
      }
    }
  }, [purchased, isBlockchainBasics, state.referredBy, dispatch]);
  
  const handlePurchase = () => {
    try {
      console.log(`Покупка исследования ${id} с эффектами:`, effectData);
      dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: id } });
      setIsOpen(false); // Сворачиваем карточку после покупки
      
      // Если это "Основы блокчейна" и есть referredBy, активируем реферала
      if (isBlockchainBasics && state.referredBy) {
        console.log('Приобретены "Основы блокчейна", активируем реферала');
        const userId = localStorage.getItem('userId');
        if (userId) {
          setTimeout(() => {
            dispatch({ type: "ACTIVATE_REFERRAL", payload: { referralId: userId } });
          }, 500);
        }
      }
      
      if (onPurchase) onPurchase();
    } catch (error) {
      console.error(`Ошибка при покупке исследования ${id}:`, error);
    }
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
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[12px]`}>
            {resource.name}
          </span>
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[12px]`}>
            {formatNumber(Number(amount))}
          </span>
        </div>
      );
    });
  };
  
  const renderEffects = () => {
    return Object.entries(effectData).map(([effectId, amount]) => {
      if (effectId === 'knowledgeBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{boostPercent}% к скорости накопления Знаний о крипте
          </div>
        );
      } else if (effectId === 'knowledgeMaxBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{boostPercent}% к максимуму Знаний о крипте
          </div>
        );
      } else if (effectId === 'usdtMaxBoost') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{boostPercent}% к максимуму USDT
          </div>
        );
      } else if (effectId.includes('Boost')) {
        const resourceId = effectId.replace('Boost', '');
        const boostPercent = Number(amount) * 100;
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{boostPercent}% к скорости накопления {resourceName}
          </div>
        );
      } else if (effectId.includes('Max')) {
        const resourceId = effectId.replace('Max', '');
        const resourceName = state.resources[resourceId]?.name || resourceId;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{formatNumber(Number(amount))} к максимуму {resourceName}
          </div>
        );
      } else if (effectId === 'conversionRate') {
        const boostPercent = Number(amount) * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[12px] w-full">
            +{boostPercent}% к конвертации
          </div>
        );
      }
      
      return (
        <div key={effectId} className="text-blue-600 text-[12px] w-full">
          +{String(amount)} к {effectId}
        </div>
      );
    });
  };
  
  if (purchased) {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="border rounded-lg bg-gray-50 shadow-sm mb-2 overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100">
            <h3 className="font-semibold text-[12px] flex items-center">
              {name} <Sparkles className="ml-1 h-3 w-3 text-amber-500" />
            </h3>
            <ChevronRight className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0">
            <p className="text-[12px] text-gray-600 mb-1 w-full">{description}</p>
            <div className="mt-2 border-t pt-2">
              <h4 className="text-xs font-medium mb-1">Эффекты:</h4>
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
      className={`border rounded-lg ${canAfford() ? 'bg-white' : 'bg-gray-100'} shadow-sm mb-2 overflow-hidden`}
    >
      <CollapsibleTrigger asChild>
        <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50">
          <h3 className="font-semibold text-[12px]">{name}</h3>
          <ChevronRight className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-3 pt-0">
          <p className="text-[12px] text-gray-600 mb-3 w-full">{description}</p>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-xs font-medium">Стоимость:</h4>
              {renderCost()}
            </div>
            
            <div className="border-t pt-2">
              <h4 className="text-xs font-medium mb-1">Эффекты:</h4>
              {renderEffects()}
            </div>
            
            <div className="border-t pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        onClick={handlePurchase} 
                        disabled={!canAfford()}
                        variant={canAfford() ? "default" : "outline"}
                        size="sm"
                        className="text-[12px] w-full"
                      >
                        Исследовать
                      </Button>
                    </div>
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
