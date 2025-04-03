
import React, { useEffect, useRef } from "react";
import { Resource } from "@/context/types";
import { formatResourceValue } from "@/utils/resourceFormatConfig";
import { useResourceAnimation } from "@/hooks/useResourceAnimation";

interface ResourceDisplayProps {
  resource: Resource;
  formattedValue?: string;
  formattedPerSecond?: string;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource, formattedValue: propFormattedValue, formattedPerSecond: propFormattedPerSecond }) => {
  const { id, name, value = 0, max = Infinity, perSecond = 0 } = resource;
  const prevValueRef = useRef(value);
  const resourceRef = useRef<HTMLDivElement>(null);
  
  // Используем хук анимации для плавного обновления отображаемого значения
  // Проверяем, что значение определено перед передачей его в хук
  const safeValue = value !== null && value !== undefined ? value : 0;
  const animatedValue = useResourceAnimation(safeValue, id);
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Форматирование значений с учетом типа ресурса
  const formattedValue = propFormattedValue || formatResourceValue(animatedValue, id);
  
  // Форматируем максимальное значение всегда без десятичных знаков
  const formattedMax = max === Infinity 
    ? "∞" 
    : max >= 1000000 
      ? Math.floor(max / 1000000) + "M"
      : max >= 1000 
        ? Math.floor(max / 1000) + "K" 
        : Math.floor(max).toString();
  
  // Форматирование скорости производства с учетом K и M для тысяч и миллионов
  const safePerSecond = perSecond !== null && perSecond !== undefined ? perSecond : 0;
  const formattedPerSecond = propFormattedPerSecond || (
    Math.abs(safePerSecond) >= 1000000 
      ? (safePerSecond / 1000000).toFixed(1).replace('.0', '') + "M" 
      : Math.abs(safePerSecond) >= 1000 
        ? (safePerSecond / 1000).toFixed(1).replace('.0', '') + "K"
        : formatResourceValue(safePerSecond, id)
  );
  
  // Эффект для выделения изменений
  useEffect(() => {
    // Если значение изменилось существенно, выделяем это изменение
    if (safeValue !== null && prevValueRef.current !== null && Math.abs(safeValue - prevValueRef.current) > 0.1) {
      const element = resourceRef.current?.querySelector(`#resource-value-${id}`);
      if (element) {
        // Добавляем класс для анимации, затем удаляем его
        element.classList.add('resource-changed');
        setTimeout(() => {
          element.classList.remove('resource-changed');
        }, 500);
      }
      prevValueRef.current = safeValue;
    }
  }, [safeValue, id]);

  // Добавляем отладочную информацию при наведении
  const debugValue = safeValue !== null ? safeValue.toFixed(2) : "0.00";
  const debugPerSecond = safePerSecond !== null ? safePerSecond.toFixed(3) : "0.000";
  const debugInfo = `ID: ${id}, Значение: ${debugValue}, Производство: ${debugPerSecond}/сек`;

  // Преобразуем название ресурса
  let displayName = name;
  if (id === 'usdt') {
    displayName = 'USDT';
  } else if (id === 'bitcoin') {
    displayName = 'Bitcoin';
  } else if (id === 'knowledge') {
    displayName = 'Знания';
  } else if (id === 'electricity') {
    displayName = 'Электричество';
  } else if (id === 'computingPower') {
    displayName = 'Вычисл. мощность';
  }

  return (
    <div className="w-full text-xs" ref={resourceRef} title={debugInfo}>
      <div className="flex justify-between items-center">
        <div className="font-medium text-gray-900">{displayName}</div>
        <div className="flex flex-col items-end">
          <div className="font-medium" id={`resource-value-${id}`}>
            {formattedValue}
            {max !== Infinity && (
              <span className="text-gray-500 text-[0.7rem]">/{formattedMax}</span>
            )}
          </div>
          {perSecond !== 0 && (
            <div className={`text-[0.7rem] ${isNegativeRate ? 'text-red-500' : 'text-green-500'}`}>
              {isNegativeRate ? '' : '+'}{formattedPerSecond}/сек
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDisplay;
