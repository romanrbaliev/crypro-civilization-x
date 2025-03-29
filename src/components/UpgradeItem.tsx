
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/helpers';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sparkles, 
  Lock, 
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { formatEffectName, formatEffect, getSpecializationName } from '@/utils/researchUtils';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface UpgradeItemProps {
  upgrade: any;
  onPurchase?: () => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase }) => {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Проверка доступности исследования
  const canPurchase = () => {
    if (!upgrade.unlocked || upgrade.purchased) return false;
    
    // Проверяем наличие необходимых ресурсов
    for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
      if (state.resources[resourceId]?.value < Number(amount)) {
        return false;
      }
    }
    return true;
  };
  
  // Проверка зависимостей от других исследований
  const hasMissingDependencies = () => {
    if (!upgrade.requiredUpgrades || upgrade.requiredUpgrades.length === 0) return false;
    
    return upgrade.requiredUpgrades.some(
      (requiredId: string) => !state.upgrades[requiredId]?.purchased
    );
  };
  
  // Покупка исследования
  const handlePurchase = () => {
    if (!canPurchase()) return;
    
    try {
      dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: upgrade.id } });
      if (onPurchase) onPurchase();
    } catch (error) {
      console.error(`Ошибка при покупке исследования ${upgrade.id}:`, error);
    }
  };
  
  // Отображение стоимости
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount], index) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource?.value >= Number(amount);
      
      return (
        <div key={resourceId} className="flex justify-between w-full">
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {resource?.name || resourceId}
          </span>
          <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
            {formatNumber(Number(amount))}
          </span>
        </div>
      );
    });
  };
  
  // Отображение эффектов
  const renderEffects = () => {
    // Безопасно получаем объект эффектов
    const effects = upgrade.effects || upgrade.effect || {};
    
    if (Object.keys(effects).length === 0) {
      // Проверяем специальные ID улучшений - основы блокчейна
      if (upgrade.id === 'blockchainBasics' || upgrade.id === 'basicBlockchain' || upgrade.id === 'blockchain_basics') {
        return (
          <div className="text-blue-600 text-[11px]">
            Прирост знаний: +10%, Максимум знаний: +50%
          </div>
        );
      }
      
      // Добавляем эффекты для других исследований, у которых нет свойства effects
      if (upgrade.id === 'cryptoCurrencyBasics') {
        return (
          <div className="text-blue-600 text-[11px]">
            Эффективность знаний: +10%
          </div>
        );
      }
      
      if (upgrade.id === 'algorithmOptimization') {
        return (
          <div className="text-blue-600 text-[11px]">
            Эффективность майнинга: +15%
          </div>
        );
      }
      
      if (upgrade.id === 'walletSecurity') {
        return (
          <div className="text-blue-600 text-[11px]">
            Максимум USDT: +25%
          </div>
        );
      }
    }
    
    return Object.entries(effects).map(([effectId, amount], index) => {
      const formattedEffect = formatEffect(effectId, Number(amount));
      return (
        <div key={effectId} className="text-blue-600 text-[11px]">
          {formattedEffect}
        </div>
      );
    });
  };
  
  // Получение описания требуемых улучшений
  const getRequiredUpgradesText = () => {
    if (!upgrade.requiredUpgrades || upgrade.requiredUpgrades.length === 0) return null;
    
    const requiredNames = upgrade.requiredUpgrades.map((reqId: string) => {
      const requiredUpgrade = state.upgrades[reqId];
      return requiredUpgrade ? requiredUpgrade.name : reqId;
    }).join(", ");
    
    return `Требуется: ${requiredNames}`;
  };
  
  // Отображение специализации
  const renderSpecialization = () => {
    if (!upgrade.specialization) return null;
    
    return (
      <span className="text-purple-600 text-xs ml-1">
        {getSpecializationName(upgrade.specialization)}
      </span>
    );
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border rounded-lg ${canPurchase() ? 'bg-white' : 'bg-gray-100'} ${upgrade.purchased ? 'border-green-200 bg-green-50' : 'border-gray-200'} shadow-sm mb-2 overflow-hidden`}
    >
      <CollapsibleTrigger asChild>
        <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xs font-medium flex items-center">
                {upgrade.name} 
                {upgrade.purchased && <Sparkles className="h-3 w-3 text-amber-500 ml-1" />}
                {!upgrade.unlocked && <Lock className="h-3 w-3 text-gray-400 ml-1" />}
                {hasMissingDependencies() && <AlertCircle className="h-3 w-3 text-red-400 ml-1" />}
                {renderSpecialization()}
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
            {!upgrade.purchased && (
              <div className="space-y-1">
                <h4 className="text-[11px] font-medium">Стоимость:</h4>
                {renderCost()}
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <h4 className="text-[11px] font-medium mb-1">Эффекты:</h4>
              {renderEffects()}
            </div>
            
            <div className="border-t pt-2 mt-2 flex justify-center">
              {upgrade.purchased ? (
                <span className="text-xs px-4 py-1.5 bg-green-100 text-green-600 rounded w-full text-center">
                  Исследовано
                </span>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={!canPurchase()}
                  variant={canPurchase() ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs"
                >
                  Исследовать
                </Button>
              )}
            </div>
            
            {hasMissingDependencies() && (
              <div className="text-[11px] text-red-500 mt-1">
                {getRequiredUpgradesText()}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default UpgradeItem;
