
import React from "react";
import { Upgrade } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/helpers";
import { useGame } from "@/context/GameContext";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onPurchase?: () => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase }) => {
  const { state, dispatch } = useGame();
  const { id, name, description, cost, effect, purchased } = upgrade;
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: id } });
    if (onPurchase) onPurchase();
  };
  
  // Проверка, достаточно ли ресурсов для покупки
  const canAfford = () => {
    for (const [resourceId, amount] of Object.entries(cost)) {
      if (state.resources[resourceId].value < amount) {
        return false;
      }
    }
    return true;
  };
  
  // Форматирование списка затрат
  const renderCost = () => {
    return Object.entries(cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource.value >= amount;
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[7px]`}>
          {formatNumber(amount)} {resource.name}
        </div>
      );
    });
  };
  
  // Форматирование списка эффектов
  const renderEffects = () => {
    return Object.entries(effect).map(([effectId, amount]) => {
      if (effectId.includes('Boost')) {
        const boostPercent = amount * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[7px]">
            +{boostPercent}% к эффективности
          </div>
        );
      } else if (effectId === 'conversionRate') {
        const boostPercent = amount * 100;
        return (
          <div key={effectId} className="text-blue-600 text-[7px]">
            +{boostPercent}% к конверсии
          </div>
        );
      }
      
      return (
        <div key={effectId} className="text-blue-600 text-[7px]">
          +{amount} к {effectId}
        </div>
      );
    });
  };
  
  if (purchased) {
    return (
      <div className="p-2 border rounded-lg bg-gray-50 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-[8px] flex items-center">
              {name} <Sparkles className="ml-1 h-2 w-2 text-amber-500" />
            </h3>
            <p className="text-[7px] text-gray-600 mb-1">{description}</p>
            <div className="mt-1 text-[7px]">
              {renderEffects()}
            </div>
          </div>
          <div className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[7px] font-medium">
            Исследовано
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[8px]">{name}</h3>
          <p className="text-[7px] text-gray-600 mb-1">{description}</p>
          <div className="flex flex-col gap-1">
            {renderCost()}
          </div>
          <div className="mt-1">
            {renderEffects()}
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handlePurchase} 
                disabled={!canAfford()}
                variant={canAfford() ? "default" : "outline"}
                size="sm"
                className="text-[7px] h-5 px-2"
              >
                Исследовать
              </Button>
            </TooltipTrigger>
            {!canAfford() && (
              <TooltipContent side="left">
                <p className="text-[7px]">Недостаточно ресурсов</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default UpgradeItem;
