
import React from "react";
import { Resource } from "@/context/types";
import { formatNumber } from "@/utils/helpers";

interface ResourceDisplayProps {
  resource: Resource;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource }) => {
  const { id, name, value, max, perSecond } = resource;
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Расчет процента заполнения
  const fillPercentage = max === Infinity ? 0 : Math.min(100, (value / max) * 100);
  
  // Определяем классы для отображения прогресса
  const progressColorClass = fillPercentage > 90 
    ? "bg-red-500" 
    : fillPercentage > 70 
      ? "bg-yellow-500" 
      : "bg-blue-500";
  
  // Форматирование чисел с десятичными знаками
  const formatDecimal = (num: number): string => {
    if (num === Infinity) return "∞";
    if (Math.abs(num) % 1 === 0) return Math.floor(Math.abs(num)).toString();
    return Math.abs(num).toFixed(3);
  };
  
  // Специальное форматирование для BTC
  const formatValue = (resourceId: string, val: number): string => {
    if (resourceId === 'btc') {
      return val.toFixed(5);
    }
    return formatNumber(val);
  };
  
  return (
    <div className="w-full text-xs">
      <div className="flex justify-between items-center mb-0.5">
        <div className="font-medium text-[9px] truncate mr-1 max-w-[70%]">{name}</div>
        <div className="text-gray-600 text-[10px] whitespace-nowrap">
          {formatValue(id, value)}
          {max !== Infinity && ` / ${formatValue(id, max)}`}
        </div>
      </div>
      
      {max !== Infinity && (
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div 
            className={`h-1 rounded-full ${progressColorClass}`} 
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      )}
      
      {/* Отображаем скорость только если она не равна нулю */}
      {perSecond !== 0 && (
        <div className="flex items-center justify-end">
          <div className={`text-[8px] ${isNegativeRate ? 'text-red-500' : 'text-gray-500'}`}>
            {isNegativeRate ? "-" : "+"}{id === 'btc' ? perSecond.toFixed(5) : formatDecimal(Math.abs(perSecond))}/сек
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
