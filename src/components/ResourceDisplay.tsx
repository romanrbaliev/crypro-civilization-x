
import React from "react";
import { Resource } from "@/context/types";
import ResourceForecast from "./ResourceForecast";

interface ResourceDisplayProps {
  resource: Resource;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource }) => {
  const { id, name, value, max, rate } = resource;
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = rate < 0;
  
  // Расчет процента заполнения
  const fillPercentage = max === Infinity ? 0 : Math.min(100, (value / max) * 100);
  
  // Форматирование значений
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(2)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(2)}K`;
    } else {
      return val.toFixed(2);
    }
  };
  
  // Определяем классы для отображения прогресса
  const progressColorClass = fillPercentage > 90 
    ? "bg-red-500" 
    : fillPercentage > 70 
      ? "bg-yellow-500" 
      : "bg-blue-500";
  
  return (
    <div className="w-full text-xs">
      <div className="flex justify-between items-center mb-0.5">
        <div className="font-medium">{name}</div>
        <div className="text-gray-600">
          {formatValue(value)}
          {max !== Infinity && ` / ${formatValue(max)}`}
        </div>
      </div>
      
      {max !== Infinity && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-0.5">
          <div 
            className={`h-1.5 rounded-full ${progressColorClass}`} 
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className={`text-xs ${isNegativeRate ? 'text-red-500' : 'text-gray-500'}`}>
          {isNegativeRate ? "-" : "+"}{Math.abs(rate).toFixed(2)}/сек
        </div>
        
        {/* Показываем прогноз только если есть изменение скорости */}
        {rate !== 0 && (
          <ResourceForecast resource={resource} />
        )}
      </div>
    </div>
  );
};

export default ResourceDisplay;
