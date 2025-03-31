
import React from "react";
import { Upgrade } from "@/context/types";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    default:
      return `${effectId}: ${amount}`;
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
  };
  
  // Формируем описание эффектов
  let effectsDescription: string[] = [];
  
  // Добавляем специальные эффекты для известных исследований
  const specialEffect = getSpecialEffectDescription(upgrade.id);
  if (specialEffect) {
    effectsDescription.push(specialEffect);
  }
  
  // Добавляем стандартные эффекты из объекта effects
  if (upgrade.effects) {
    for (const [effectId, amount] of Object.entries(upgrade.effects)) {
      effectsDescription.push(formatUpgradeEffect(effectId, Number(amount)));
    }
  }
  
  // Объединяем описания эффектов в строку
  const formattedEffects = effectsDescription.join('. ');
  
  return (
    <Card className={`mb-4 ${upgrade.purchased ? 'bg-gray-50' : 'bg-white'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{upgrade.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs mb-2">
          {upgrade.description}
        </CardDescription>
        
        {formattedEffects && (
          <div className="text-xs text-green-700 mb-2">
            {formattedEffects}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mb-3">
          Стоимость:
          {Object.entries(upgrade.cost).map(([resourceId, cost]) => (
            <span key={resourceId} className="ml-2">
              {cost} {resources[resourceId]?.name || resourceId}
            </span>
          ))}
        </div>
        
        <Button
          variant={upgrade.purchased ? "secondary" : canAfford ? "default" : "outline"}
          size="sm"
          disabled={upgrade.purchased || !canAfford}
          onClick={handlePurchase}
          className="w-full"
        >
          {upgrade.purchased ? "Исследовано" : "Исследовать"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradeItem;
