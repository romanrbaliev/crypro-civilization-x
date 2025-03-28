
import React, { useEffect, useRef } from "react";
import { Resource } from "@/context/types";
import { formatResourceValue } from "@/utils/resourceFormatConfig";
import { useResourceAnimation } from "@/hooks/useResourceAnimation";

interface ResourceDisplayProps {
  resource: Resource;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource }) => {
  const { id, name, value, max, perSecond } = resource;
  const prevValueRef = useRef(value);
  
  // Используем хук анимации для мгновенного обновления отображаемого значения
  const animatedValue = useResourceAnimation(value, id);
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Расчет процента заполнения (мгновенно обновляется)
  const fillPercentage = max === Infinity ? 0 : Math.min(100, Math.max(0, (animatedValue / max) * 100));
  
  // Определяем классы для отображения прогресса
  const progressColorClass = fillPercentage > 90 
    ? "bg-red-500" 
    : fillPercentage > 70 
      ? "bg-yellow-500" 
      : "bg-blue-500";
  
  // Форматирование значений с учетом типа ресурса
  const formattedValue = formatResourceValue(animatedValue, id);
  
  // Форматируем максимальное значение всегда без десятичных знаков
  const formattedMax = max === Infinity 
    ? "∞" 
    : max >= 1000000 
      ? Math.floor(max / 1000000) + "M"
      : max >= 1000 
        ? Math.floor(max / 1000) + "K" 
        : Math.floor(max).toString();
  
  // Форматирование скорости производства с учетом типа ресурса и K/M для тысяч/миллионов
  const formattedPerSecond = 
    Math.abs(perSecond) >= 1000000 
      ? (perSecond / 1000000).toFixed(1).replace('.0', '') + "M" 
      : Math.abs(perSecond) >= 1000 
        ? (perSecond / 1000).toFixed(1).replace('.0', '') + "K"
        : formatResourceValue(perSecond, id);
  
  // Эффект для выделения изменений
  useEffect(() => {
    // Если значение изменилось существенно, выделяем это изменение
    if (Math.abs(value - prevValueRef.current) > 0.1) {
      const element = document.getElementById(`resource-value-${id}`);
      if (element) {
        // Добавляем класс для анимации, затем удаляем его
        element.classList.add('resource-changed');
        setTimeout(() => {
          element.classList.remove('resource-changed');
        }, 500);
      }
      prevValueRef.current = value;
    }
  }, [value, id]);

  return (
    <div className="w-full text-xs">
      <div className="flex justify-between items-center mb-0.5">
        <div className="font-medium text-[9px] truncate mr-1 max-w-[70%]">{name}</div>
        <div id={`resource-value-${id}`} className="text-gray-600 text-[10px] whitespace-nowrap transition-colors">
          {formattedValue}
          {max !== Infinity && ` / ${formattedMax}`}
        </div>
      </div>
      
      {max !== Infinity && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-1 rounded-full ${progressColorClass}`} 
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      )}
      
      {/* Отображаем скорость только если она не равна нулю */}
      {perSecond !== 0 && (
        <div className="flex items-center justify-end">
          <div className={`text-[8px] ${isNegativeRate ? 'text-red-500' : 'text-green-500'}`}>
            {isNegativeRate ? "" : "+"}{formattedPerSecond}/сек
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
