
import React, { useState } from "react";
import { Upgrade } from "@/context/types";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import {
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface UpgradeItemProps {
  upgrade: Upgrade;
  onAddEvent: (message: string, type: string) => void;
}

// Функция для перевода и форматирования эффектов исследований
const formatUpgradeEffect = (effectId: string, amount: number): string => {
  switch (effectId) {
    case 'knowledgeBoost':
      return `Увеличение производства знаний на ${amount * 100}%`;
    case 'knowledgeMaxBoost':
      return `Увеличение максимума знаний на ${amount * 100}%`;
    case 'usdtMaxBoost':
      return `Увеличение максимума USDT на ${amount * 100}%`;
    case 'miningEfficiencyBoost':
      return `Повышение эффективности майнинга на ${amount * 100}%`;
    case 'electricityEfficiencyBoost':
      return `Увеличение эффективности электричества на ${amount * 100}%`;
    case 'maxStorage':
      if (!isNaN(amount)) {
        return `Увеличение максимального хранилища на ${amount * 100}%`;
      }
      return '';
    default:
      // Если эффект не распознан, не отображаем его
      return '';
  }
};

// Переводы специальных эффектов исследований
const getSpecialEffectDescription = (upgradeId: string): string => {
  switch (upgradeId) {
    case 'blockchainBasics':
    case 'basicBlockchain': 
    case 'blockchain_basics':
      return 'Увеличение максимума знаний на 50%. Разблокирует Криптокошелек.';
      
    case 'algorithmOptimization':
      return 'Увеличение эффективности майнинга на 15%';
      
    case 'cryptoCurrencyBasics':
      return 'Увеличение эффективности применения знаний на 10%';
      
    case 'walletSecurity':
      return 'Увеличение максимального хранения криптовалют на 25%';
      
    default:
      return '';
  }
};

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { resources } = state;
  const [isOpen, setIsOpen] = useState(false);
  
  // Проверяем, доступно ли исследование
  const canAfford = Object.entries(upgrade.cost).every(
    ([resourceId, cost]) => (resources[resourceId]?.value || 0) >= cost
  );
  
  const handlePurchase = () => {
    if (!canAfford) {
      onAddEvent(`Недостаточно ресурсов для исследования "${upgrade.name}"`, "error");
      return;
    }
    
    dispatch({
      type: "PURCHASE_UPGRADE",
      payload: { upgradeId: upgrade.id }
    });
    
    // Вызываем коллбэк после успешной покупки
    onAddEvent(`Завершено исследование: ${upgrade.name}`, "success");
    setIsOpen(false);
  };
  
  // Формируем описание эффектов
  let effectsDescription: string[] = [];
  
  // Добавляем специальные эффекты для известных исследований
  const specialEffect = getSpecialEffectDescription(upgrade.id);
  if (specialEffect) {
    effectsDescription.push(specialEffect);
  } else if (upgrade.effects) {
    // Добавляем стандартные эффекты из объекта effects
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      const formattedEffect = formatUpgradeEffect(effectId, Number(amount));
      if (formattedEffect) {
        effectsDescription.push(formattedEffect);
      }
    }
  }
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border rounded-lg ${canAfford ? 'bg-white' : 'bg-gray-100'} shadow-sm mb-2 overflow-hidden`}
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
          
          <div className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-[11px] font-medium">Стоимость исследования:</h4>
              {Object.entries(upgrade.cost).map(([resourceId, amount]) => {
                const resource = state.resources[resourceId];
                const hasEnough = resource?.value >= Number(amount);
                
                return (
                  <div key={resourceId} className="flex justify-between w-full">
                    <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
                      {resource?.name || resourceId}
                    </span>
                    <span className={`${hasEnough ? 'text-gray-600' : 'text-red-500'} text-[11px]`}>
                      {amount}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t pt-2 mt-2">
              <h4 className="text-[11px] font-medium mb-1">Эффекты:</h4>
              {effectsDescription.length > 0 ? (
                effectsDescription.map((effect, index) => (
                  <div key={index} className="text-green-600 text-[11px]">
                    {effect}
                  </div>
                ))
              ) : (
                <div className="text-green-600 text-[11px]">Нет дополнительных эффектов</div>
              )}
            </div>
            
            <div className="border-t pt-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handlePurchase}
                        disabled={!canAfford || upgrade.purchased}
                        variant={canAfford && !upgrade.purchased ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs"
                      >
                        {upgrade.purchased ? "Исследовано" : "Исследовать"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canAfford && !upgrade.purchased && (
                    <TooltipContent>
                      <p className="text-xs">Недостаточно ресурсов</p>
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
