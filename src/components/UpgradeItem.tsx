
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
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade }) => {
  const { state, dispatch } = useGame();
  const { id, name, description, cost, effect, purchased } = upgrade;
  
  const handlePurchase = () => {
    dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: id } });
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
        <div key={resourceId} className={`flex items-center space-x-1 ${hasEnough ? 'text-gray-600' : 'text-red-500'}`}>
          <span>{resource.icon}</span>
          <span>{formatNumber(amount)}</span>
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
          <div key={effectId} className="text-blue-600">
            +{boostPercent}% к эффективности
          </div>
        );
      } else if (effectId === 'conversionRate') {
        const boostPercent = amount * 100;
        return (
          <div key={effectId} className="text-blue-600">
            +{boostPercent}% к конверсии
          </div>
        );
      }
      
      return (
        <div key={effectId} className="text-blue-600">
          +{amount} к {effectId}
        </div>
      );
    });
  };
  
  if (purchased) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              {name} <Sparkles className="ml-2 h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <div className="mt-2 text-sm">
              {renderEffects()}
            </div>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Исследовано
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {renderCost()}
          </div>
          <div className="mt-2 text-sm">
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
              >
                Исследовать
              </Button>
            </TooltipTrigger>
            {!canAfford() && (
              <TooltipContent side="left">
                <p>Недостаточно ресурсов</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default UpgradeItem;
