
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
      name: 'text-black dark:text-white',
      value: 'text-black dark:text-white',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    usdt: {
      name: 'text-black dark:text-white',
      value: 'text-black dark:text-white',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    electricity: {
      name: 'text-black dark:text-white',
      value: 'text-black dark:text-white',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    computingPower: {
      name: 'text-black dark:text-white',
      value: 'text-black dark:text-white',
      perSecond: 'text-green-600 dark:text-green-400'
    },
    bitcoin: {
      name: 'text-black dark:text-white',
      value: 'text-black dark:text-white',
      perSecond: 'text-green-600 dark:text-green-400'
    }
  };
  
  return (
    <div className="p-4 space-y-1">
      {unlockedResources.map(resource => (
        <div key={resource.id} className="py-2 border-b">
          <div className="flex justify-between items-center mb-1">
            <span className={`${resourceColors[resource.id]?.name || 'text-black dark:text-white'} text-xs`}>
              {resource.name}
            </span>
            <span className={`${resourceColors[resource.id]?.value || 'text-black dark:text-white'} text-xs`}>
              {formatNumber(resource.value, 2)} / {formatNumber(resource.max, 0)}
            </span>
          </div>
          
          {resource.perSecond !== 0 && (
            <div className="text-right">
              <span className={resource.perSecond > 0 
                ? (resourceColors[resource.id]?.perSecond || 'text-green-600 dark:text-green-400')
                : 'text-red-600 dark:text-red-400'
              } className="text-xs">
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
