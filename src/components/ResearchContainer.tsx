
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { Upgrade } from '@/context/types';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { formatNumber } from '@/utils/helpers';
import { t } from '@/localization';

export function ResearchContainer() {
  // Используем обновленный хук с правильным доступом к state и dispatch
  const { state, dispatch } = useGameState();
  
  const handlePurchase = (upgrade: Upgrade) => {
    dispatch({ type: 'PURCHASE_UPGRADE', payload: { upgradeId: upgrade.id } });
    safeDispatchGameEvent(t("events.researchComplete", [t(`upgrades.${upgrade.id}.name`)]), 'success');
  };
  
  // Фильтруем только разблокированные и не купленные исследования
  const availableResearch = Object.values(state.upgrades).filter(
    upgrade => upgrade.unlocked && !upgrade.purchased
  );
  
  // Логируем наличие исследования "Криптосообщество"
  const cryptoCommunity = Object.values(state.upgrades).find(
    upgrade => upgrade.id === 'cryptoCommunity'
  );
  
  console.log("ResearchContainer: Наличие криптосообщества:", 
    cryptoCommunity ? `${cryptoCommunity.id} (разблокировано: ${cryptoCommunity.unlocked})` : "Отсутствует"
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-3">{t("ui.tabs.research")}</h2>
      {availableResearch.length > 0 ? (
        <div className="space-y-3">
          {availableResearch.map((upgrade) => (
            <div key={upgrade.id} className="border p-3 rounded-md">
              <div className="flex justify-between">
                <h3 className="font-medium">{t(`upgrades.${upgrade.id}.name`)}</h3>
                <button
                  onClick={() => handlePurchase(upgrade)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs"
                  disabled={!canAfford(upgrade, state)}
                >
                  {t("ui.actions.research")}
                </button>
              </div>
              <p className="text-sm text-gray-600 my-1">{t(`upgrades.${upgrade.id}.description`)}</p>
              <div className="text-xs text-gray-500">
                {Object.entries(upgrade.cost).map(([resource, amount]) => (
                  <div key={resource} className="flex justify-between">
                    <span>{state.resources[resource] ? t(`resources.${resource}.name`) : resource}</span>
                    <span>
                      {formatNumber(Number(amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>{t("ui.states.empty.research")}</p>
        </div>
      )}
    </div>
  );
}

// Функция для проверки возможности приобретения исследования
function canAfford(upgrade: Upgrade, state: GameState): boolean {
  for (const [resourceId, amount] of Object.entries(upgrade.cost)) {
    const resource = state.resources[resourceId];
    if (!resource || resource.value < Number(amount)) {
      return false;
    }
  }
  return true;
}
