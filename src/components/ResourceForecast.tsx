
import React from 'react';
import { Resource } from '@/context/types';
import { calculateTimeToReach } from '@/utils/helpers';
import { useTranslation } from '@/i18n';
import { useResources } from '@/hooks/useResources';

interface ResourceForecastProps {
  resource: Resource;
  targetValue: number;
  label?: string;
}

const ResourceForecast: React.FC<ResourceForecastProps> = ({ 
  resource, 
  targetValue, 
  label = "Прогноз" 
}) => {
  const { formatValue } = useResources();
  const { t } = useTranslation();
  
  // Если нет производства или уже достигнуто целевое значение
  if (resource.perSecond <= 0 || resource.value >= targetValue) {
    return null;
  }
  
  // Рассчитываем время до достижения цели
  const timeToReach = calculateTimeToReach(resource.value, targetValue, resource.perSecond);
  
  return (
    <div className="text-xs text-gray-600 mt-1 p-1 border border-gray-200 rounded">
      <div className="flex justify-between items-center">
        <span>{label || t('resources.forecast')}:</span>
        <span>{timeToReach}</span>
      </div>
      <div className="w-full bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
        <div 
          className="bg-green-400 h-full rounded-full"
          style={{ width: `${Math.min(100, (resource.value / targetValue) * 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ResourceForecast;
