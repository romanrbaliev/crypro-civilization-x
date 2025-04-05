
import React from 'react';
import { Resource } from '@/context/types';
import { Progress } from './ui/progress';
import { formatNumber } from '@/utils/helpers';

interface ResourceDisplayProps {
  resources: { [key: string]: Resource };
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources }) => {
  // Отфильтровываем только разблокированные ресурсы
  const unlockedResources = Object.values(resources).filter(resource => resource.unlocked);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Ресурсы</h2>
      
      <div className="space-y-3">
        {unlockedResources.map(resource => (
          <div key={resource.id} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {resource.name}
              </span>
              <span className="text-sm text-gray-600">
                {formatNumber(resource.value)} / {formatNumber(resource.max)}
              </span>
            </div>
            
            <Progress 
              value={(resource.value / resource.max) * 100} 
              className="h-2"
            />
            
            {resource.perSecond > 0 && (
              <div className="text-xs text-gray-500 text-right">
                +{formatNumber(resource.perSecond)} / сек
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceDisplay;
