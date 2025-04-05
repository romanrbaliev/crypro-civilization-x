
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ResearchList: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Получаем разблокированные, но не купленные улучшения
  const availableUpgrades = Object.values(state.upgrades).filter(
    upgrade => upgrade.unlocked && !upgrade.purchased
  );
  
  // Получаем уже купленные улучшения
  const purchasedUpgrades = Object.values(state.upgrades).filter(
    upgrade => upgrade.purchased
  );
  
  // Состояние для открытых/закрытых карточек
  const [expandedUpgrades, setExpandedUpgrades] = React.useState<{[key: string]: boolean}>({});
  
  // Переключение состояния карточки
  const toggleUpgrade = (upgradeId: string) => {
    setExpandedUpgrades(prev => ({
      ...prev,
      [upgradeId]: !prev[upgradeId]
    }));
  };
  
  // Покупка улучшения
  const handlePurchaseUpgrade = (upgradeId: string) => {
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { upgradeId } });
  };
  
  // Проверка, может ли игрок позволить улучшение
  const canAffordUpgrade = (upgrade: any) => {
    return Object.entries(upgrade.cost).every(([resourceId, cost]) => {
      const resource = state.resources[resourceId];
      return resource && resource.unlocked && resource.value >= Number(cost);
    });
  };
  
  // Отображение эффектов улучшения
  const renderEffects = (effects: any) => {
    if (!effects) return null;
    
    return Object.entries(effects).map(([effectId, value]) => {
      let effectName = '';
      let effectValue = '';
      
      // Форматирование эффекта для отображения
      if (effectId.includes('Multiplier')) {
        const resourceName = effectId.replace('Multiplier', '');
        const formattedName = resourceName
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^./, str => str.toUpperCase());
        
        effectName = formattedName;
        const percent = (Number(value) - 1) * 100;
        effectValue = `+${percent}%`;
      } else {
        effectName = effectId
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/^./, str => str.toUpperCase());
        
        if (typeof value === 'number' && value > 0) {
          effectValue = `+${value}`;
        } else {
          effectValue = `${value}`;
        }
      }
      
      return (
        <div key={effectId} className="flex justify-between">
          <span className="text-gray-600">{effectName}:</span>
          <span className="text-blue-500">{effectValue}</span>
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-4">
      {availableUpgrades.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          Нет доступных исследований
        </div>
      ) : (
        <>
          <h2 className="text-lg font-medium">Доступные исследования</h2>
          {availableUpgrades.map(upgrade => {
            const isExpanded = expandedUpgrades[upgrade.id] ?? false;
            
            return (
              <div 
                key={upgrade.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Заголовок карточки */}
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleUpgrade(upgrade.id)}
                >
                  <div className="flex items-center">
                    <h3 className="font-medium">{upgrade.name}</h3>
                  </div>
                  <div>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
                
                {/* Развернутая информация */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-4">{upgrade.description}</p>
                    
                    {/* Стоимость */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Стоимость:</h4>
                      {Object.entries(upgrade.cost).map(([resourceId, cost]) => {
                        const resource = state.resources[resourceId];
                        const canAfford = resource && resource.value >= Number(cost);
                        
                        return (
                          <div key={resourceId} className="flex justify-between items-center">
                            <span className="text-gray-600">{state.resources[resourceId]?.name}:</span>
                            <span className={canAfford ? "text-gray-600" : "text-red-500"}>
                              {formatNumber(Number(cost), 0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Эффекты */}
                    {upgrade.effects && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Эффекты:</h4>
                        {renderEffects(upgrade.effects)}
                      </div>
                    )}
                    
                    {/* Кнопка покупки */}
                    <Button
                      onClick={() => handlePurchaseUpgrade(upgrade.id)}
                      disabled={!canAffordUpgrade(upgrade)}
                      className="w-full mt-4"
                      variant="default"
                    >
                      Исследовать
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          
          {purchasedUpgrades.length > 0 && (
            <>
              <h2 className="text-lg font-medium mt-8">Завершенные исследования</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 p-4">
                <ul className="divide-y">
                  {purchasedUpgrades.map(upgrade => (
                    <li key={upgrade.id} className="py-2">
                      <span className="font-medium">{upgrade.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResearchList;
