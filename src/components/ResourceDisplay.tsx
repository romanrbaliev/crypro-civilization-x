
import React from "react";
import { Resource } from "@/context/types";
import { useResources } from "@/hooks/useResources";
import { useTranslation } from "@/i18n";

interface ResourceDisplayProps {
  resource: Resource;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resource }) => {
  const { formatValue } = useResources();
  const { t, language } = useTranslation();
  
  const { id, name, value = 0, max = Infinity, perSecond = 0 } = resource;
  
  // Определяем, положительная или отрицательная скорость производства
  const isNegativeRate = perSecond < 0;
  
  // Форматируем значения
  const formattedValue = formatValue(value, id);
  const formattedMax = max === Infinity ? "∞" : formatValue(max, id);
  const formattedPerSecond = formatValue(Math.abs(perSecond), id);
  
  // Получаем переведенное название ресурса
  const resourceKey = `resources.${id}` as any;
  const displayName = t(resourceKey) || name;
  
  // Отладочная информация
  const debugInfo = `ID: ${id}, Значение: ${value}, Макс: ${max}, Производство: ${perSecond}/сек`;
  
  return (
    <div className="w-full text-xs" title={debugInfo}>
      <div className="flex justify-between items-center mb-0.5">
        <div className="font-medium text-[9px] truncate mr-1 max-w-[70%]">{displayName}</div>
        <div className="text-gray-600 text-[10px] whitespace-nowrap">
          {formattedValue}
          {max !== Infinity && ` / ${formattedMax}`}
        </div>
      </div>
      
      {/* Отображаем скорость только если она не равна нулю */}
      {perSecond !== 0 && (
        <div className="flex items-center justify-end">
          <div className={`text-[8px] ${isNegativeRate ? 'text-red-500' : 'text-green-500'}`}>
            {isNegativeRate ? "-" : "+"}{formattedPerSecond}/{t('resources.perSecond')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
