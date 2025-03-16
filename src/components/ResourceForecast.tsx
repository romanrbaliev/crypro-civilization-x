
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
            <div className="flex items-center space-x-1 text-[7px] text-muted-foreground cursor-help">
              <Clock className="h-2 w-2" />
              <span>{label}: ∞</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[7px]">Нет активного производства {resource.name}</p>
            <p className="text-[7px]">Постройте здания или исследуйте улучшения</p>
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
            <div className="flex items-center space-x-1 text-[7px] text-green-600 cursor-help">
              <Clock className="h-2 w-2" />
              <span>{label}: Готово!</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[7px]">У вас уже есть необходимое количество {resource.name}</p>
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
          <div className="flex items-center space-x-1 text-[7px] text-muted-foreground cursor-help">
            <Clock className="h-2 w-2" />
            <span>{label}: {timeToReach}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-[7px]">Время до достижения {formatNumber(targetValue)} {resource.name}</p>
          <p className="text-[7px]">При текущей скорости {formatNumber(resource.perSecond)}/сек</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResourceForecast;
