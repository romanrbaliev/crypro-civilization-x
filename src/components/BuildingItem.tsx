
import React from 'react';
import { Building, Resource } from '@/context/types';
import { formatNumber } from '@/utils/formatters';

type BuildingItemProps = {
  building: Building;
  resources?: Record<string, Resource>;
  onBuy: () => void;
  onSell?: () => void;
  showSell?: boolean;
  compact?: boolean;
};

// Функция для проверки доступности ресурсов
const canAfford = (cost: Record<string, number> | undefined, resources: Record<string, Resource> = {}): boolean => {
  if (!cost) return false;
  
  return Object.entries(cost).every(([resourceId, amount]) => {
    const resource = resources[resourceId];
    return resource && resource.value !== undefined && resource.value >= amount;
  });
};

// Функция для получения текущей стоимости
const getNextCost = (building: Building): Record<string, number> => {
  // Проверяем наличие стоимости
  if (building.cost) {
    return building.cost;
  }
  
  // Если нет cost, но есть baseCost, вычисляем стоимость
  if (building.baseCost) {
    const costMultiplier = building.costMultiplier || 1.12;
    const count = building.count || 0;
    
    // Создаем новый объект стоимости
    const calculatedCost: Record<string, number> = {};
    
    // Для каждого ресурса в базовой стоимости
    Object.entries(building.baseCost).forEach(([resourceId, baseAmount]) => {
      // Вычисляем новую стоимость с учетом количества зданий и множителя
      const scaledAmount = Number(baseAmount) * Math.pow(costMultiplier, count);
      calculatedCost[resourceId] = Math.round(scaledAmount);
    });
    
    return calculatedCost;
  }
  
  // Если нет никакой информации о стоимости, возвращаем пустой объект
  console.warn(`Здание ${building.name} не имеет свойства cost или baseCost`);
  return {};
};

// Основной компонент для отображения здания
const BuildingItem: React.FC<BuildingItemProps> = ({
  building,
  resources = {},
  onBuy,
  onSell,
  showSell = false,
  compact = false
}) => {
  // Безопасно получаем текущую стоимость здания
  const currentCost = getNextCost(building);
  
  // Проверяем, можем ли купить здание
  const canBuy = canAfford(currentCost, resources);
  
  // Краткий режим отображения для компактных списков
  if (compact) {
    return (
      <div className="flex flex-col gap-1 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">{building.name}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {building.count || 0}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex-grow">
            {Object.entries(currentCost).map(([resourceId, amount]) => (
              <div key={resourceId} className="flex items-center text-xs">
                <span className={resources[resourceId]?.value >= amount ? 'text-gray-600' : 'text-red-600'}>
                  {formatNumber(amount)} {resources[resourceId]?.name || resourceId}
                </span>
              </div>
            ))}
          </div>
          
          <button
            onClick={onBuy}
            disabled={!canBuy}
            className={`text-xs px-2 py-1 rounded ${
              canBuy ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}
          >
            +
          </button>
        </div>
      </div>
    );
  }
  
  // Полный режим отображения
  return (
    <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-sm font-bold">{building.name}</h3>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {building.count || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{building.description}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-1">
        <div>
          {Object.entries(currentCost).map(([resourceId, amount]) => (
            <div key={resourceId} className="flex items-center text-xs">
              <span className={resources[resourceId]?.value >= amount ? 'text-gray-600' : 'text-red-600'}>
                {formatNumber(amount)} {resources[resourceId]?.name || resourceId}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-1">
          {showSell && building.count > 0 && onSell && (
            <button
              onClick={onSell}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
            >
              -
            </button>
          )}
          
          <button
            onClick={onBuy}
            disabled={!canBuy}
            className={`text-xs px-3 py-1 rounded ${
              canBuy ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingItem;
