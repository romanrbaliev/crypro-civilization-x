
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
  // Проверяем, что скорость производства ресурса больше 0
  const timeToReach = resource.perSecond > 0 
    ? calculateTimeToReach(resource.value, targetValue, resource.perSecond)
    : "∞"; // Если скорость 0, то время бесконечно
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground cursor-help">
            <Clock className="h-3 w-3" />
            <span>{label}: {timeToReach}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Время до достижения {formatNumber(targetValue)} {resource.name}</p>
          <p className="text-xs">При текущей скорости {formatNumber(resource.perSecond)}/сек</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResourceForecast;
