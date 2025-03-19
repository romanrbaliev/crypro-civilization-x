
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
import { Sparkles, Lock, AlertCircle } from 'lucide-react';
import { formatEffectName, formatEffect } from '@/utils/researchUtils';

interface TechTreeNodeProps {
  upgrade: any;
  onAddEvent: (message: string, type: string) => void;
}

const TechTreeNode: React.FC<TechTreeNodeProps> = ({ upgrade, onAddEvent }) => {
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
    try {
      // Безопасно получаем объект эффектов
      const effects = upgrade.effects || upgrade.effect || {};
      console.log(`Покупка исследования ${upgrade.id} с эффектами:`, effects);
      
      dispatch({ type: "PURCHASE_UPGRADE", payload: { upgradeId: upgrade.id } });
      onAddEvent(`Завершено исследование: ${upgrade.name}`, "success");
    } catch (error) {
      console.error(`Ошибка при покупке исследования ${upgrade.id}:`, error);
      onAddEvent(`Ошибка при покупке исследования: ${upgrade.name}`, "error");
    }
  };
  
  // Отображение стоимости
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource?.value >= Number(amount);
      
      return (
        <div key={resourceId} className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[9px]`}>
          {resource?.icon} {formatNumber(Number(amount))}
        </div>
      );
    });
  };
  
  // Отображение эффектов
  const renderEffects = () => {
    // Безопасно получаем объект эффектов
    const effects = upgrade.effects || upgrade.effect || {};
    
    return Object.entries(effects).map(([effectId, amount]) => {
      const formattedEffect = formatEffect(effectId, Number(amount));
      return (
        <div key={effectId} className="text-blue-600 text-[9px]">
          {formattedEffect}
        </div>
      );
    });
  };
  
  // Отображение специализации
  const renderSpecialization = () => {
    if (!upgrade.specialization) return null;
    
    const specializationMap: {[key: string]: string} = {
      miner: "Майнер",
      trader: "Трейдер",
      investor: "Инвестор",
      influencer: "Инфлюенсер",
      defi: "DeFi"
    };
    
    return (
      <div className="text-[9px] text-purple-600 mt-1">
        Специализация: {specializationMap[upgrade.specialization] || upgrade.specialization}
      </div>
    );
  };
  
  // Определение стиля узла в зависимости от состояния
  const getNodeStyle = () => {
    if (upgrade.purchased) {
      return "border-green-200 bg-green-50";
    }
    if (!upgrade.unlocked || hasMissingDependencies()) {
      return "border-gray-200 bg-gray-50 opacity-75";
    }
    if (canPurchase()) {
      return "border-blue-200 bg-blue-50";
    }
    return "border-gray-200 bg-white";
  };
  
  // Получение имени требуемого улучшения
  const getRequiredUpgradeName = (requiredId: string) => {
    const upgrade = state.upgrades[requiredId];
    return upgrade ? upgrade.name : requiredId;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`border rounded-lg p-2 ${getNodeStyle()} relative`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-medium flex items-center">
                  {upgrade.name}
                  {upgrade.purchased && <Sparkles className="ml-1 h-3 w-3 text-amber-500" />}
                  {!upgrade.unlocked && <Lock className="ml-1 h-3 w-3 text-gray-400" />}
                  {hasMissingDependencies() && <AlertCircle className="ml-1 h-3 w-3 text-red-400" />}
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5 mb-1">{upgrade.description}</div>
                
                {upgrade.unlocked && !upgrade.purchased && (
                  <div className="flex gap-3 mt-1">
                    <div className="flex flex-col gap-0.5">
                      {renderCost()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {renderEffects()}
                    </div>
                  </div>
                )}
                
                {renderSpecialization()}
              </div>
              
              {upgrade.unlocked && !upgrade.purchased && (
                <Button
                  size="sm"
                  variant={canPurchase() ? "default" : "outline"}
                  disabled={!canPurchase()}
                  onClick={handlePurchase}
                  className="text-[9px] h-6 px-2 py-0 ml-1"
                >
                  Изучить
                </Button>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs">
            <div className="font-medium">{upgrade.name}</div>
            <div className="text-gray-500 mt-1">{upgrade.description}</div>
            
            {hasMissingDependencies() && (
              <div className="mt-2 text-red-500">
                <div className="font-medium">Требуются исследования:</div>
                <ul className="list-disc list-inside mt-1">
                  {upgrade.requiredUpgrades?.map((requiredId: string) => (
                    <li key={requiredId}>{getRequiredUpgradeName(requiredId)}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!upgrade.unlocked && !hasMissingDependencies()) && (
              <div className="mt-2 text-amber-500">
                <div className="font-medium">Условия разблокировки:</div>
                <div className="mt-1">
                  {upgrade.unlockCondition?.buildings && Object.entries(upgrade.unlockCondition.buildings).map(([buildingId, count]) => (
                    <div key={buildingId}>
                      {state.buildings[buildingId]?.name ?? buildingId}: {String(count)}
                    </div>
                  ))}
                  {upgrade.unlockCondition?.resources && Object.entries(upgrade.unlockCondition.resources).map(([resourceId, amount]) => (
                    <div key={resourceId}>
                      {state.resources[resourceId]?.name ?? resourceId}: {String(amount)}
                    </div>
                  ))}
                  {!upgrade.unlockCondition && "Продолжайте развиваться для открытия этого исследования."}
                </div>
              </div>
            )}
            
            {upgrade.unlocked && !upgrade.purchased && (
              <>
                <div className="mt-2">
                  <div className="font-medium">Стоимость:</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {renderCost()}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="font-medium">Эффекты:</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {renderEffects()}
                  </div>
                </div>
              </>
            )}
            
            {upgrade.specialization && (
              <div className="mt-2 text-purple-600">
                <div className="font-medium">Специализация:</div>
                <div className="mt-1">{upgrade.specialization}</div>
              </div>
            )}
            
            {upgrade.tier > 0 && (
              <div className="mt-2 text-gray-500">
                <div className="font-medium">Уровень технологии:</div>
                <div className="mt-1">{upgrade.tier}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TechTreeNode;
