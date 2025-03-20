
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Resource } from "@/context/types";
import { formatNumber } from "@/utils/helpers";

interface ResourceForecastProps {
  resource: Resource;
  targetValue: number;
  label?: string;
}

const ResourceForecast: React.FC<ResourceForecastProps> = ({ 
  resource, 
  targetValue,
  label
}) => {
  // Вычисляем прогресс
  const progress = useMemo(() => {
    if (resource.value >= targetValue) return 100;
    return Math.floor((resource.value / targetValue) * 100);
  }, [resource.value, targetValue]);

  // Вычисляем время до достижения цели
  const timeEstimate = useMemo(() => {
    if (resource.value >= targetValue) return "Достигнуто!";
    if (resource.perSecond <= 0) return "∞";
    
    const remaining = targetValue - resource.value;
    const secondsLeft = remaining / resource.perSecond;
    
    if (secondsLeft < 60) {
      return `${Math.ceil(secondsLeft)} сек`;
    } else if (secondsLeft < 3600) {
      return `${Math.ceil(secondsLeft / 60)} мин`;
    } else {
      return `${Math.ceil(secondsLeft / 3600)} ч`;
    }
  }, [resource.value, targetValue, resource.perSecond]);

  return (
    <div className="forecast-container">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
        <span>{label || `${resource.name} до ${formatNumber(targetValue)}`}</span>
        <span>{timeEstimate}</span>
      </div>
      <Progress value={progress} className="h-1 w-full" />
      <div className="text-right text-xs text-gray-500 mt-1">
        {formatNumber(resource.value)}/{formatNumber(targetValue)} ({progress}%)
      </div>
    </div>
  );
};

export default ResourceForecast;
