
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
  Info
} from 'lucide-react';
import { formatEffectName, formatEffect, getSpecializationName } from '@/utils/researchUtils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface UpgradeItemProps {
  upgrade: any;
  onPurchase?: () => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onPurchase }) => {
  const { state, dispatch } = useGame();
  
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
        <span key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-xs`}>
          {index > 0 && ", "}
          {resource?.icon || ''} {formatNumber(Number(amount))}
        </span>
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
          <span className="text-blue-600 text-xs">
            +50% к максимуму знаний, +10% к приросту
          </span>
        );
      }
      
      // Добавляем эффекты для других исследований, у которых нет свойства effects
      if (upgrade.id === 'cryptoCurrencyBasics') {
        return (
          <span className="text-blue-600 text-xs">
            +10% к эффективности применения знаний
          </span>
        );
      }
      
      if (upgrade.id === 'algorithmOptimization') {
        return (
          <span className="text-blue-600 text-xs">
            +15% к эффективности майнинга
          </span>
        );
      }
      
      if (upgrade.id === 'walletSecurity') {
        return (
          <span className="text-blue-600 text-xs">
            +25% к максимуму криптовалют
          </span>
        );
      }
    }
    
    return Object.entries(effects).map(([effectId, amount], index) => {
      const formattedEffect = formatEffect(effectId, Number(amount));
      return (
        <span key={effectId} className="text-blue-600 text-xs">
          {index > 0 && ", "}
          {formattedEffect}
        </span>
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
  
  // Определение стиля кнопки в зависимости от состояния
  const getButtonStyle = () => {
    if (upgrade.purchased) return "bg-green-100 text-green-900 hover:bg-green-200";
    if (canPurchase()) return "bg-blue-600 text-white hover:bg-blue-700";
    return "bg-gray-100 text-gray-500";
  };
  
  // Новый стиль карточки, похожий на карточки зданий
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`rounded-lg overflow-hidden shadow-sm flex flex-col ${upgrade.purchased ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center justify-between p-2 border-b border-gray-100">
              <div className="flex items-center">
                <div>
                  <h3 className="text-xs font-medium flex items-center">
                    {upgrade.name}
                    {upgrade.purchased && <Sparkles className="h-3 w-3 text-amber-500 ml-1" />}
                    {!upgrade.unlocked && <Lock className="h-3 w-3 text-gray-400 ml-1" />}
                    {hasMissingDependencies() && <AlertCircle className="h-3 w-3 text-red-400 ml-1" />}
                    {renderSpecialization()}
                  </h3>
                  <p className="text-[8px] text-gray-500 mt-0.5 max-w-[220px] truncate">
                    {upgrade.description}
                  </p>
                </div>
              </div>
              
              {!upgrade.purchased && (
                <div className="text-right text-xs">
                  {renderCost()}
                </div>
              )}
            </div>
            
            <div className="p-2 flex justify-between items-center">
              <div className="text-xs">
                <div className="text-blue-600">{renderEffects()}</div>
              </div>
              
              <div className="flex justify-end ml-auto">
                {upgrade.purchased ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                    Исследовано
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`text-xs py-0 px-2 h-6 ${getButtonStyle()}`}
                    disabled={!canPurchase()}
                    onClick={handlePurchase}
                  >
                    Исследовать
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="text-xs">
            <div className="font-medium">{upgrade.name}</div>
            <div className="text-gray-500 mt-1">{upgrade.description}</div>
            
            {upgrade.specialization && (
              <div className="mt-2">
                <div className="text-purple-600 font-medium">Специализация:</div>
                <div>{getSpecializationName(upgrade.specialization)}</div>
              </div>
            )}
            
            {!upgrade.purchased && (
              <div className="mt-2">
                <div className="font-medium">Стоимость:</div>
                <div>{renderCost()}</div>
              </div>
            )}
            
            <div className="mt-2">
              <div className="text-blue-600 font-medium">Эффекты:</div>
              <div>{renderEffects()}</div>
            </div>
            
            {hasMissingDependencies() && (
              <div className="mt-2 text-red-500">
                <div className="font-medium">{getRequiredUpgradesText()}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UpgradeItem;
