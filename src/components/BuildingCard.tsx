
import React from 'react';
import { useGameState } from '@/context/GameStateContext';
import { formatNumber } from '@/utils/helpers';
import { getResourceIcon } from '@/utils/resourceIcons';
import { Building } from '@/context/types';
import { LucideIcon } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  onBuy: () => void;
  onSell?: () => void;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, onBuy, onSell }) => {
  const { state } = useGameState();
  
  // Получаем описание эффектов здания
  const getEffectsDescription = (building: Building): string => {
    let effects = '';
    
    // Проверяем наличие производства ресурсов
    if (building.production) {
      const productionEntries = Object.entries(building.production);
      if (productionEntries.length > 0) {
        productionEntries.forEach(([resourceId, amount]) => {
          const resourceName = state.resources[resourceId]?.name || resourceId;
          effects += `+${amount} ${resourceName}/сек, `;
        });
      }
    }
    
    // Проверяем наличие специальных эффектов по buildingId
    switch (building.id) {
      case 'cryptoWallet':
        effects += '+50 к макс. USDT, +25% к макс. Знаниям, ';
        break;
      case 'internetConnection':
        effects += '+20% к скорости получения знаний, +5% к эффективности производства вычисл. мощности, ';
        break;
      case 'coolingSystem':
        effects += '-20% к потреблению вычислительной мощности, ';
        break;
      case 'improvedWallet':
        effects += '+150 к макс. USDT, +1 к макс. BTC, +8% к эффективности конвертации BTC на USDT, ';
        break;
      case 'cryptoLibrary':
        effects += '+50% к скорости получения знаний, +100 к макс. Знаниям, ';
        break;
    }
    
    // Удаляем последнюю запятую и пробел
    if (effects) {
      effects = effects.slice(0, -2);
    }
    
    return effects || 'Нет активных эффектов';
  };
  
  // Проверка, достаточно ли ресурсов для покупки
  const canAfford = (): boolean => {
    if (!building.cost) return true;
    
    for (const [resourceId, baseCost] of Object.entries(building.cost)) {
      const resource = state.resources[resourceId];
      if (!resource) return false;
      
      // Рассчитываем текущую стоимость с учетом множителя
      const currentCost = calculateCurrentCost(baseCost);
      
      if (resource.value < currentCost) {
        return false;
      }
    }
    
    return true;
  };
  
  // Рассчет текущей стоимости здания с учетом множителя и количества уже купленных зданий
  const calculateCurrentCost = (baseCost: number): number => {
    const count = building.count || 0;
    const multiplier = building.costMultiplier || 1.15;
    return Math.floor(baseCost * Math.pow(multiplier, count));
  };
  
  return (
    <div className="border p-3 rounded-md mb-2 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {building.name} {building.count ? `(${building.count})` : ''}
        </h3>
        <div className="flex gap-2">
          {onSell && building.count > 0 && (
            <button
              onClick={onSell}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs"
            >
              Продать
            </button>
          )}
          <button
            onClick={onBuy}
            disabled={!canAfford()}
            className={`px-2 py-1 rounded text-xs ${
              canAfford() ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            Купить
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{building.description}</p>
      
      {/* Отображение эффектов */}
      <div className="mt-2">
        <p className="text-xs font-medium">Эффекты:</p>
        <p className="text-xs text-gray-600">{getEffectsDescription(building)}</p>
      </div>
      
      {/* Отображение стоимости */}
      <div className="mt-2">
        <p className="text-xs font-medium">Стоимость:</p>
        <div className="text-xs text-gray-600">
          {building.cost && Object.entries(building.cost).map(([resourceId, baseCost]) => {
            const cost = calculateCurrentCost(Number(baseCost));
            const resourceName = state.resources[resourceId]?.name || resourceId;
            const Icon = getResourceIcon(resourceId) as LucideIcon;
            
            return (
              <div key={resourceId} className="flex items-center">
                {Icon && <Icon size={12} className="mr-1" />}
                <span>{resourceName}: {formatNumber(cost)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;
