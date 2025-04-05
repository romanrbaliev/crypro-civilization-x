
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import { formatNumber } from '@/utils/helpers';

const ResourceSidebar: React.FC = () => {
  const { state } = useGame();
  
  // Получаем разблокированные ресурсы
  const unlockedResources = Object.values(state.resources).filter(resource => resource.unlocked);
  
  // Цвета для разных типов ресурсов
  const resourceColors = {
    knowledge: {
      name: 'text-blue-700 dark:text-blue-400',
      value: 'text-blue-800 dark:text-blue-300',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    usdt: {
      name: 'text-green-700 dark:text-green-400',
      value: 'text-green-800 dark:text-green-300',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    electricity: {
      name: 'text-yellow-700 dark:text-yellow-400',
      value: 'text-yellow-800 dark:text-yellow-300',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    computingPower: {
      name: 'text-purple-700 dark:text-purple-400',
      value: 'text-purple-800 dark:text-purple-300',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    bitcoin: {
      name: 'text-orange-700 dark:text-orange-400',
      value: 'text-orange-800 dark:text-orange-300',
      perSecond: 'text-green-600 dark:text-green-400'
    }
  };
  
  return (
    <div className="p-4 space-y-1">
      {unlockedResources.map(resource => (
        <div key={resource.id} className="p-2 border-b">
          <div className="flex justify-between items-center">
            <span className={`${resourceColors[resource.id]?.name || 'text-gray-700 dark:text-gray-300'}`}>
              {resource.name}
            </span>
            <span className={`${resourceColors[resource.id]?.value || 'text-gray-800 dark:text-gray-200'} font-medium`}>
              {formatNumber(resource.value, 2)} / {formatNumber(resource.max, 0)}
            </span>
          </div>
          
          {resource.perSecond !== 0 && (
            <div className="text-right">
              <span className={resource.perSecond > 0 
                ? (resourceColors[resource.id]?.perSecond || 'text-green-600 dark:text-green-400')
                : 'text-red-600 dark:text-red-400'
              }>
                {resource.perSecond > 0 ? '+' : ''}{formatNumber(resource.perSecond, 2)}/сек
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResourceSidebar;
