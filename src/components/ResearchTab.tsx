
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Upgrade } from '@/context/types';
import { canAfford, formatNumber } from '@/utils/helpers';
import { Button } from './ui/button';
import { getSafeGameId } from '@/utils/gameIdsUtils';

const ResearchTab: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Получаем разблокированные, но не купленные улучшения
  const availableUpgrades = Object.values(state.upgrades).filter(
    upgrade => upgrade.unlocked && !upgrade.purchased
  );
  
  // Получаем уже купленные улучшения
  const purchasedUpgrades = Object.values(state.upgrades).filter(
    upgrade => upgrade.purchased
  );
  
  // Обработчик покупки улучшения
  const handlePurchase = (upgradeId: string) => {
    const normalizedId = getSafeGameId('upgrades', upgradeId, upgradeId);
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { upgradeId: normalizedId } });
  };
  
  // Функция для отображения стоимости улучшения
  const renderCost = (upgrade: Upgrade) => {
    return Object.entries(upgrade.cost).map(([resourceId, cost]) => {
      const resourceValue = state.resources[resourceId]?.value || 0;
      const canBuy = resourceValue >= cost;
      
      return (
        <span 
          key={resourceId}
          className={`text-sm ${canBuy ? 'text-gray-600' : 'text-red-500'}`}
        >
          {state.resources[resourceId]?.name}: {formatNumber(cost)}
        </span>
      );
    });
  };
  
  // Функция для проверки, может ли игрок позволить улучшение
  const canPurchase = (upgrade: Upgrade) => {
    const currentResources: { [key: string]: number } = {};
    Object.entries(state.resources).forEach(([resourceId, resource]) => {
      currentResources[resourceId] = resource.value;
    });
    
    return canAfford(currentResources, upgrade.cost);
  };
  
  // Функция для отображения эффектов улучшения
  const renderEffects = (upgrade: Upgrade) => {
    if (!upgrade.effects) return null;
    
    return Object.entries(upgrade.effects).map(([effectId, value]) => {
      let effectName = '';
      let effectValue = '';
      
      if (effectId.includes('Max')) {
        effectName = `Максимум ${effectId.replace('Max', '')}`;
        effectValue = value > 1 ? `+${(value - 1) * 100}%` : `-${(1 - value) * 100}%`;
      } else if (effectId.includes('Production')) {
        effectName = `Производство ${effectId.replace('Production', '')}`;
        effectValue = value > 1 ? `+${(value - 1) * 100}%` : `-${(1 - value) * 100}%`;
      } else if (effectId.includes('Efficiency')) {
        effectName = `Эффективность ${effectId.replace('Efficiency', '')}`;
        effectValue = value > 1 ? `+${(value - 1) * 100}%` : `-${(1 - value) * 100}%`;
      } else if (effectId.includes('Consumption')) {
        effectName = `Потребление ${effectId.replace('Consumption', '')}`;
        effectValue = value < 1 ? `-${(1 - value) * 100}%` : `+${(value - 1) * 100}%`;
      } else {
        effectName = effectId;
        effectValue = `${value > 0 ? '+' : ''}${value}`;
      }
      
      return (
        <div key={effectId} className="text-sm text-blue-600">
          {effectName}: {effectValue}
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Доступные исследования</h2>
        
        {availableUpgrades.length === 0 ? (
          <p className="text-gray-500">Нет доступных исследований.</p>
        ) : (
          <div className="space-y-3">
            {availableUpgrades.map(upgrade => (
              <div
                key={upgrade.id}
                className="p-3 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-semibold">{upgrade.name}</div>
                    <div className="text-sm text-gray-600">{upgrade.description}</div>
                    <div className="space-y-1 mt-2">
                      {renderEffects(upgrade)}
                    </div>
                    <div className="space-y-1 mt-2">
                      {renderCost(upgrade)}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={!canPurchase(upgrade)}
                    onClick={() => handlePurchase(upgrade.id)}
                  >
                    Исследовать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {purchasedUpgrades.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Завершенные исследования</h2>
          
          <div className="space-y-3">
            {purchasedUpgrades.map(upgrade => (
              <div
                key={upgrade.id}
                className="p-3 border rounded-lg bg-gray-50"
              >
                <div className="space-y-1">
                  <div className="font-semibold">{upgrade.name}</div>
                  <div className="text-sm text-gray-600">{upgrade.description}</div>
                  <div className="space-y-1 mt-2">
                    {renderEffects(upgrade)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTab;
