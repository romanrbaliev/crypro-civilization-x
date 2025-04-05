
import React from 'react';
import { formatNumber } from '@/utils/numberUtils';
import { Resource } from '@/context/types';

interface ResourceItemProps {
  resource: Resource;
  name: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource, name }) => {
  // Расчет прогресса ресурса
  const progress = resource.max ? Math.min(100, (resource.value / resource.max) * 100) : 0;
  
  // Определение класса для цвета прогресса
  const getProgressClass = () => {
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };
  
  return (
    <div className="resource-item">
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center">
          <span className="resource-name font-medium">{name}</span>
          <span className="resource-value font-bold">
            {formatNumber(resource.value)}
            {resource.max ? ` / ${formatNumber(resource.max)}` : ''}
          </span>
        </div>
        
        {resource.max > 0 && (
          <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full ${getProgressClass()}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {resource.perSecond !== undefined && resource.perSecond !== 0 && (
          <div className="text-sm text-gray-500 mt-1">
            {resource.perSecond > 0 ? '+' : ''}{formatNumber(resource.perSecond)}/сек
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceItem;
