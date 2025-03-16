
import React from "react";
import { formatNumber } from "@/utils/helpers";
import { Progress } from "@/components/ui/progress";
import { Resource } from "@/context/GameContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResourceDisplayProps {
  resource: Resource;
  compact?: boolean;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource, compact = false }) => {
  const { id, name, icon, value, perSecond, max } = resource;
  const percentage = max === Infinity ? 100 : (value / max) * 100;
  const isNegative = perSecond < 0;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <span className="text-xl">{icon}</span>
              <span className="font-medium">{formatNumber(value)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="space-y-1">
              <p className="font-semibold">{name}</p>
              {perSecond !== 0 && (
                <p className={`text-xs ${isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {isNegative ? '' : '+'}{formatNumber(perSecond)}/сек
                </p>
              )}
              {max !== Infinity && (
                <p className="text-xs text-muted-foreground">
                  {formatNumber(value)}/{formatNumber(max)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium resource-name">{name}</span>
        </div>
        <div className="text-right">
          <div className="font-medium resource-value">{formatNumber(value)}</div>
          {perSecond !== 0 && (
            <div className={`resource-per-second ${isNegative ? 'text-red-600' : ''}`}>
              {isNegative ? '' : '+'}{formatNumber(perSecond)}/сек
            </div>
          )}
        </div>
      </div>
      
      {max !== Infinity && (
        <div className="relative">
          <Progress value={percentage} className="h-2" />
          <div className="resource-value text-gray-500 mt-0.5 text-right">
            {formatNumber(value)}/{formatNumber(max)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
