
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/numberUtils';
import { Upgrade } from '@/context/types';
import { useI18nContext } from '@/context/I18nContext';

interface UpgradeItemProps {
  upgrade: Upgrade;
  onAddEvent: (message: string, type: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onAddEvent }) => {
  const { state, dispatch } = useGame();
  const { t } = useI18nContext();
  
  // Определяем, можно ли купить исследование
  const canPurchase = () => {
    if (upgrade.purchased) return false;
    
    for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
      if (!state.resources[resourceId] || state.resources[resourceId].value < amount) {
        return false;
      }
    }
    
    return true;
  };
  
  // Обработчик покупки исследования
  const handlePurchase = () => {
    if (!canPurchase()) return;
    
    // Отправляем действие покупки
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { upgradeId: upgrade.id }
    });
    
    // Добавляем событие в лог
    onAddEvent(`${t('research.purchased')}: ${upgrade.name}`, 'success');
  };
  
  // Отображаем стоимость исследования
  const renderCost = () => {
    return Object.entries(upgrade.cost).map(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      const hasEnough = resource && resource.value >= amount;
      
      return (
        <span 
          key={resourceId} 
          className={`mr-2 ${hasEnough ? 'text-green-600' : 'text-red-600'}`}
        >
          {formatNumber(amount)} {resourceId}
        </span>
      );
    });
  };
  
  return (
    <div className={`upgrade-item ${upgrade.purchased ? 'purchased' : ''}`}>
      <div className="upgrade-header">
        <h4 className="upgrade-name">{upgrade.name}</h4>
        <span className={`upgrade-status ${upgrade.purchased ? 'purchased' : 'available'}`}>
          {upgrade.purchased ? t('research.purchased') : t('research.available')}
        </span>
      </div>
      
      <p className="upgrade-description">{upgrade.description}</p>
      
      {!upgrade.purchased && (
        <>
          <div className="upgrade-cost">
            {t('ui.cost')}: {renderCost()}
          </div>
          
          <button
            className="upgrade-buy-btn"
            onClick={handlePurchase}
            disabled={!canPurchase()}
          >
            {t('ui.buy')}
          </button>
        </>
      )}
    </div>
  );
};

export default UpgradeItem;
