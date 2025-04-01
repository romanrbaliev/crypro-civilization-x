
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upgrade } from '@/context/types';
import { useGame } from '@/context/hooks/useGame';

// Экспортируем эти функции во вспомогательном файле
const formatResourceValue = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
};

const getResourceIcon = (resourceId: string) => {
  switch (resourceId) {
    case 'knowledge': return '📚';
    case 'usdt': return '💲';
    case 'electricity': return '⚡';
    case 'computingPower': return '🖥️';
    case 'bitcoin': return '₿';
    default: return '🔹';
  }
};

const getResourceColor = (resourceId: string) => {
  switch (resourceId) {
    case 'knowledge': return 'text-blue-600';
    case 'usdt': return 'text-green-600';
    case 'electricity': return 'text-yellow-600';
    case 'computingPower': return 'text-purple-600';
    case 'bitcoin': return 'text-amber-600';
    default: return 'text-gray-600';
  }
};

const canAfford = (resources: any, costs: any) => {
  if (!costs) return true;
  
  for (const resourceId in costs) {
    const resource = resources[resourceId];
    const cost = costs[resourceId];
    if (!resource || resource.value < cost) {
      return false;
    }
  }
  
  return true;
};

interface UpgradeItemProps {
  upgrade: Upgrade;
  index?: number;
  onAddEvent?: (message: string, type: string) => void;
}

// Компонент для отображения отдельного улучшения
const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, index, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const [hovered, setHovered] = useState(false);
  
  // Обработка покупки улучшения
  const handlePurchase = () => {
    if (!upgrade.unlocked || upgrade.purchased) return;
    
    const canBuy = canAfford(state.resources, upgrade.cost);
    if (!canBuy) return;
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { upgradeId: upgrade.id }
    });
    
    // Вызываем onAddEvent, если он определен
    if (onAddEvent) {
      onAddEvent(`Приобретено улучшение: ${upgrade.name}`, "success");
    }
  };
  
  // Функция для определения цвета карточки улучшения
  const getCardStyle = () => {
    if (upgrade.purchased) return 'bg-slate-100';
    if (!upgrade.unlocked) return 'bg-gray-100 opacity-70';
    if (hovered) return 'bg-blue-50';
    return 'bg-white';
  };
  
  // Функция для отображения стоимости улучшения
  const renderCost = () => {
    if (!upgrade.cost) return null;
    
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      if (!resource) return null;
      
      const canPay = resource.value >= amount;
      const textColor = canPay ? 'text-green-600' : 'text-red-600';
      
      return (
        <div key={resourceId} className="flex items-center space-x-1">
          <span className={`${getResourceColor(resourceId)}`}>
            {getResourceIcon(resourceId)}
          </span>
          <span className={textColor}>
            {formatResourceValue(amount)} {resource.name}
          </span>
        </div>
      );
    });
  };
  
  // Функция для отображения эффектов улучшения
  const renderEffects = () => {
    if (!upgrade.effects) return null;
    
    return Object.entries(upgrade.effects).map(([effectId, value]) => {
      // Определяем понятное название эффекта и его значение
      let effectName = effectId;
      let effectValue = value;
      
      // Преобразуем technicalId в человекочитаемое название
      switch(effectId) {
        case 'knowledgeMaxBoost':
          effectName = 'Увеличение макс. знаний';
          effectValue = value * 100;
          break;
        case 'knowledgeBoost':
          effectName = 'Бонус к производству знаний';
          effectValue = value * 100;
          break;
        case 'usdtMaxBoost':
          effectName = 'Увеличение макс. USDT';
          effectValue = value * 100;
          break;
        case 'miningEfficiency':
          effectName = 'Эффективность майнинга';
          effectValue = value * 100;
          break;
        case 'energyEfficiency':
          effectName = 'Энергоэффективность';
          effectValue = value * 100;
          break;
        default:
          effectName = effectId;
      }
      
      return (
        <div key={effectId} className="text-sm">
          <span className="text-blue-600">
            {effectName}: +{effectValue}%
          </span>
        </div>
      );
    });
  };
  
  return (
    <Card
      className={`transition-colors ${getCardStyle()}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardHeader className="px-4 py-2">
        <CardTitle className="text-lg">{upgrade.name}</CardTitle>
        <CardDescription className="text-sm">{upgrade.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 py-2 space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Стоимость:</p>
          {renderCost()}
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Эффекты:</p>
          {renderEffects()}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2">
        <Button 
          className="w-full" 
          variant={upgrade.purchased ? "secondary" : (upgrade.unlocked ? "default" : "outline")}
          disabled={!upgrade.unlocked || upgrade.purchased}
          onClick={handlePurchase}
        >
          {upgrade.purchased ? "Приобретено" : (upgrade.unlocked ? "Купить" : "Заблокировано")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpgradeItem;
