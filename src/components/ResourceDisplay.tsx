
import React, { useEffect, useRef, memo } from "react";
import { Resource } from "@/context/types";
import { useResourceAnimation } from "@/hooks/useResourceAnimation";
import { useResourceSystem } from "@/hooks/useResourceSystem";

interface ResourceDisplayProps {
  resource: Resource;
  formattedValue?: string;
  formattedPerSecond?: string;
}

// Используем memo для предотвращения лишних перерисовок
const ResourceDisplay: React.FC<ResourceDisplayProps> = memo(({ 
  resource, 
  formattedValue: propFormattedValue, 
  formattedPerSecond: propFormattedPerSecond 
}) => {
  const { id, name, value = 0, max = Infinity, perSecond = 0 } = resource;
  const prevValueRef = useRef(value);
  const resourceRef = useRef<HTMLDivElement>(null);
  const { formatValue, resourceFormatter } = useResourceSystem();
  
  // Используем хук анимации для плавного обновления отображаемого значения
  // Проверяем, что значение определено перед передачей его в хук
  const safeValue = value !== null && value !== undefined ? value : 0;
  // Отключаем анимацию, если значение передано напрямую в пропсах
  const animatedValue = propFormattedValue ? safeValue : useResourceAnimation(safeValue, id);
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Форматирование значений с учетом типа ресурса если не передано через пропсы
  const formattedValue = propFormattedValue || formatValue(animatedValue, id);
  
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
        : formatValue(safePerSecond, id)
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
  const displayName = resourceFormatter.getDisplayName(id, name);

  return (
    <div className="w-full text-xs" ref={resourceRef} title={debugInfo}>
      <div className="flex justify-between items-center mb-0.5">
        <div className="font-medium text-[9px] truncate mr-1 max-w-[70%]">{displayName}</div>
        <div id={`resource-value-${id}`} className="text-gray-600 text-[10px] whitespace-nowrap transition-colors">
          {formattedValue}
          {max !== Infinity && ` / ${formattedMax}`}
        </div>
      </div>
      
      {/* Отображаем скорость только если она не равна нулю */}
      {safePerSecond !== 0 && (
        <div className="flex items-center justify-end">
          <div className={`text-[8px] ${isNegativeRate ? 'text-red-500' : 'text-green-500'}`}>
            {isNegativeRate ? "" : "+"}{formattedPerSecond}/сек
          </div>
        </div>
      )}
    </div>
  );
});

// Добавляем отображаемое имя для отладки
ResourceDisplay.displayName = "ResourceDisplay";

export default ResourceDisplay;
