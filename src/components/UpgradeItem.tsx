
import React from "react";
import { Upgrade } from "@/context/types";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";

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
    
    // Вызываем коллбэк после успешной покупки
    onAddEvent(`Завершено исследование: ${upgrade.name}`, "success");
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
    <div className={`border rounded-md p-3 mb-2 ${upgrade.purchased ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-1">
        <div className="font-medium">{upgrade.name}</div>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">
        {upgrade.description}
      </div>
      
      {formattedEffects && (
        <div className="text-green-600 mb-3">
          <div className="font-medium mb-1">Эффекты:</div>
          <div className="text-sm">{formattedEffects}</div>
        </div>
      )}
      
      <div className="text-gray-700 mb-3">
        <div className="font-medium mb-1">Стоимость исследования:</div>
        <div className="text-sm">
          {Object.entries(upgrade.cost).map(([resourceId, cost]) => (
            <div key={resourceId} className="text-red-500">
              {resources[resourceId]?.name || resourceId} {cost}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between gap-2">
        <Button
          variant={upgrade.purchased ? "secondary" : canAfford ? "default" : "outline"}
          size="sm"
          disabled={upgrade.purchased || !canAfford}
          onClick={handlePurchase}
          className="w-full"
        >
          {upgrade.purchased ? "Исследовано" : "Исследовать"}
        </Button>
      </div>
    </div>
  );
};

export default UpgradeItem;
