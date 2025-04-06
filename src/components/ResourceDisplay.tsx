
import React, { useEffect, useRef, memo } from "react";
import { Resource } from "@/context/types";
import { useResourceSystem } from "@/hooks/useResourceSystem";

interface ResourceDisplayProps {
  resource: Resource;
  formattedValue?: string;
  formattedPerSecond?: string;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = memo(({ 
  resource, 
  formattedValue: propFormattedValue, 
  formattedPerSecond: propFormattedPerSecond 
}) => {
  const { id, name, value = 0, max = Infinity, perSecond = 0 } = resource;
  const prevValueRef = useRef(value);
  const resourceRef = useRef<HTMLDivElement>(null);
  const { formatValue, resourceFormatter } = useResourceSystem();
  
  // Определяем отрицательную скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Форматирование значений с учетом типа ресурса
  const formattedValue = propFormattedValue || formatValue(value, id);
  
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
  
  // Эффект для выделения изменений - оптимизирован для предотвращения частых перерисовок
  useEffect(() => {
    // Если значение изменилось существенно, выделяем это изменение
    if (value !== null && prevValueRef.current !== null && 
        Math.abs(value - prevValueRef.current) > 0.5) {
      
      const element = resourceRef.current?.querySelector(`#resource-value-${id}`);
      if (element) {
        // Добавляем класс для анимации, затем удаляем его
        element.classList.add('resource-changed');
        const timerId = setTimeout(() => {
          if (element && element.classList) {
            element.classList.remove('resource-changed');
          }
        }, 500);
        
        // Очистка таймера при размонтировании
        return () => clearTimeout(timerId);
      }
      prevValueRef.current = value;
    }
  }, [value, id]);

  // Преобразуем название ресурса
  const displayName = resourceFormatter.getDisplayName(id, name);

  return (
    <div className="w-full text-xs" ref={resourceRef}>
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
}, (prevProps, nextProps) => {
  // Оптимизированная функция сравнения для memo
  // Возвращаем true, если компонент НЕ должен обновляться
  if (prevProps.formattedValue !== nextProps.formattedValue) return false;
  if (prevProps.formattedPerSecond !== nextProps.formattedPerSecond) return false;
  
  const prevRes = prevProps.resource;
  const nextRes = nextProps.resource;
  
  if (prevRes.id !== nextRes.id) return false;
  if (prevRes.value !== nextRes.value) return false;
  if (prevRes.max !== nextRes.max) return false;
  if (prevRes.perSecond !== nextRes.perSecond) return false;
  if (prevRes.name !== nextRes.name) return false;
  
  return true;
});

ResourceDisplay.displayName = 'ResourceDisplay';

export default ResourceDisplay;
