
import React from 'react';
import { Upgrade } from '@/context/types';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';

interface UpgradeCardProps {
  upgrade: Upgrade;
  onPurchase: (upgradeId: string) => void;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, onPurchase }) => {
  const { state } = useGame();
  
  // Проверка возможности покупки апгрейда
  const canAfford = () => {
    for (const [resourceId, cost] of Object.entries(upgrade.cost)) {
      const resource = state.resources[resourceId];
      if (!resource || resource.value < cost) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <div className={`border rounded p-3 ${canAfford() ? 'border-green-300' : 'border-gray-300'}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{upgrade.name}</h3>
        <button
          onClick={() => onPurchase(upgrade.id)}
          disabled={!canAfford()}
          className={`px-2 py-1 text-xs rounded-md ${canAfford() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Исследовать
        </button>
      </div>
      <p className="text-sm text-gray-600 my-1">{upgrade.description}</p>
      <div className="text-xs text-gray-500 mt-1">
        {Object.entries(upgrade.cost).map(([resourceId, amount]) => {
          const resource = state.resources[resourceId];
          return (
            <div key={resourceId} className="flex justify-between">
              <span>{resource?.name || resourceId}:</span>
              <span className={resource && resource.value >= amount ? 'text-green-600' : 'text-red-500'}>
                {formatNumber(resource?.value || 0)}/{formatNumber(amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradeCard;
