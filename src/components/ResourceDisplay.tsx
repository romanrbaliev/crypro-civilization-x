
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
  
  // Используем хук анимации для плавного изменения отображаемого значения
  const animatedValue = useResourceAnimation(value, id);
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Расчет процента заполнения
  const fillPercentage = max === Infinity ? 0 : Math.min(100, (animatedValue / max) * 100);
  
  // Определяем классы для отображения прогресса
  const progressColorClass = fillPercentage > 90 
    ? "bg-red-500" 
    : fillPercentage > 70 
      ? "bg-yellow-500" 
      : "bg-blue-500";
  
  // Форматирование значений с учетом типа ресурса
  const formattedValue = formatResourceValue(animatedValue, id);
  const formattedMax = max === Infinity ? "∞" : formatResourceValue(max, id);
  
  // Форматирование скорости производства (всегда с двумя знаками после запятой для 'knowledge')
  const formattedPerSecond = id === 'knowledge' 
    ? (isNegativeRate ? `-${Math.abs(perSecond).toFixed(2)}` : perSecond.toFixed(2))
    : (isNegativeRate ? `-${formatResourceValue(Math.abs(perSecond), id)}` : formatResourceValue(perSecond, id));
  
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
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div 
            className={`h-1 rounded-full ${progressColorClass} transition-all duration-300`} 
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
