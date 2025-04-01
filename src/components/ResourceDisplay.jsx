
import React from 'react';
import { formatNumber } from '@/utils/helpers';
import { Progress } from '@/components/ui/progress';
import { useResourceAnimation } from '@/hooks/useResourceAnimation';

const ResourceDisplay = ({ resource }) => {
  // Используем хук для анимации значения ресурса
  const animatedValue = useResourceAnimation(resource.value, resource.id);
  
  // Рассчитываем процент заполнения
  const fillPercent = resource.max > 0 ? (animatedValue / resource.max) * 100 : 0;
  
  // Форматируем значения для отображения
  const formattedValue = formatNumber(animatedValue);
  const formattedMax = formatNumber(resource.max);
  const formattedPerSecond = resource.perSecond !== 0 
    ? (resource.perSecond > 0 ? '+' : '') + formatNumber(resource.perSecond) + '/сек' 
    : '';

  return (
    <div className="resource-display w-full">
      <div className="flex justify-between items-baseline mb-1">
        <div className="text-xs font-medium">{resource.name}</div>
        <div className="text-xs text-gray-500">{formattedPerSecond}</div>
      </div>
      
      {/* Исправлено: Всегда показываем прогресс-бар */}
      <div className="relative">
        <Progress 
          value={fillPercent} 
          className="h-2" 
        />
        <div className="text-[10px] text-gray-600 mt-0.5 text-right">
          {formattedValue} / {formattedMax}
        </div>
      </div>
    </div>
  );
};

export default ResourceDisplay;
