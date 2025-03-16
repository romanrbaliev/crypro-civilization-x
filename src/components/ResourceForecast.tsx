
import React from "react";
import { Resource } from "@/context/GameContext";
import { formatNumber, calculateTimeToReach } from "@/utils/helpers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock } from "lucide-react";

interface ResourceForecastProps {
  resource: Resource;
  targetValue: number;
  label: string;
}

const ResourceForecast: React.FC<ResourceForecastProps> = ({ resource, targetValue, label }) => {
  // Если скорость равна 0, то время бесконечно
  if (resource.perSecond <= 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground cursor-help">
              <Clock className="h-2.5 w-2.5" />
              <span>{label}: ∞</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Нет активного производства {resource.name}</p>
            <p className="text-xs">Постройте здания или исследуйте улучшения</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Если у нас уже есть достаточно ресурсов, показываем "готово"
  if (resource.value >= targetValue) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 text-xs text-green-600 cursor-help">
              <Clock className="h-2.5 w-2.5" />
              <span>{label}: Готово!</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">У вас уже есть необходимое количество {resource.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // В противном случае рассчитываем время
  const timeToReach = calculateTimeToReach(resource.value, targetValue, resource.perSecond);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground cursor-help">
            <Clock className="h-2.5 w-2.5" />
            <span>{label}: {timeToReach}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Время до достижения {formatNumber(targetValue)} {resource.name}</p>
          <p className="text-xs">При текущей скорости {formatNumber(resource.perSecond)}/сек</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResourceForecast;
