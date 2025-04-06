
import React from "react";
import { Resource } from "@/context/types";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "@/i18n";

interface ResourceDisplayProps {
  resource: Resource;
  formattedValue: string;
  formattedPerSecond: string;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  resource,
  formattedValue,
  formattedPerSecond
}) => {
  const { t } = useTranslation();
  
  // Получение перевода ресурса
  const getResourceName = (resourceId: string): string => {
    const resourceKeyMap: Record<string, string> = {
      'knowledge': 'Знания',
      'usdt': 'USDT',
      'electricity': 'Электричество', 
      'computingPower': 'Вычисл. мощность',
      'bitcoin': 'Bitcoin'
    };
    
    return resourceKeyMap[resourceId] || resourceId;
  };
  
  // Цвет для показателя perSecond
  const getPerSecondColor = (perSecond: number) => {
    if (perSecond > 0) return "text-green-600";
    if (perSecond < 0) return "text-red-600";
    return "text-gray-500";
  };
  
  // Иконка для показателя perSecond
  const getPerSecondIcon = (perSecond: number) => {
    if (perSecond > 0) return <TrendingUp size={14} className="mr-1" />;
    if (perSecond < 0) return <TrendingDown size={14} className="mr-1" />;
    return null;
  };
  
  return (
    <div className="flex justify-between items-center py-0.5">
      <div>
        <div className="text-sm font-medium">{getResourceName(resource.id)}</div>
        <div className="text-sm">
          {formattedValue}
          {resource.max !== Infinity && (
            <span className="text-xs text-gray-500 ml-1">
              /{resource.max !== undefined ? formattedValue : "∞"}
            </span>
          )}
        </div>
      </div>
      
      {resource.perSecond !== 0 && (
        <div className={`flex items-center text-xs ${getPerSecondColor(resource.perSecond)}`}>
          {getPerSecondIcon(resource.perSecond)}
          {formattedPerSecond}/сек
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
