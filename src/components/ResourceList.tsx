
import React, { memo, useMemo } from "react";
import { Resource } from "@/context/types";
import ResourceDisplay from "./ResourceDisplay";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";
import { useResourceSystem } from "@/hooks/useResourceSystem";

interface ResourceListProps {
  resources: Resource[];
}

// Используем memo для предотвращения лишних перерисовок
const ResourceList: React.FC<ResourceListProps> = memo(({ resources }) => {
  const { dispatch, state } = useGame();
  const { formatValue } = useResourceSystem();
  
  // Используем useMemo для фильтрации ресурсов и предотвращения лишних перерисовок
  const unlockedResources = useMemo(() => {
    // Подробная отладка для отслеживания перерисовок
    console.log("[ResourceList] Фильтрация разблокированных ресурсов");
    return resources.filter(resource => resource.unlocked);
  }, [resources]);
  
  // Кэшируем отформатированные значения для каждого ресурса
  const formattedValues = useMemo(() => {
    console.log("[ResourceList] Форматирование значений ресурсов");
    const values: Record<string, { value: string, perSecond: string }> = {};
    
    unlockedResources.forEach(resource => {
      const safeValue = resource.value !== null && resource.value !== undefined ? resource.value : 0;
      const safePerSecond = resource.perSecond !== null && resource.perSecond !== undefined ? resource.perSecond : 0;
      
      values[resource.id] = {
        value: formatValue(safeValue, resource.id),
        perSecond: formatValue(safePerSecond, resource.id)
      };
    });
    
    return values;
  }, [unlockedResources, formatValue]);
  
  // Заполнение USDT до максимального значения
  const handleFillUsdt = () => {
    if (state.resources.usdt && state.resources.usdt.unlocked) {
      // Используем максимальное значение USDT из состояния
      const maxUsdt = state.resources.usdt.max || 0;
      const currentValue = state.resources.usdt.value || 0;
      
      // Добавляем ровно столько USDT, сколько не хватает до максимума
      const amountToAdd = maxUsdt - currentValue;
      
      if (amountToAdd > 0) {
        dispatch({
          type: "INCREMENT_RESOURCE",
          payload: {
            resourceId: "usdt",
            amount: amountToAdd
          }
        });
      }
    }
  };
  
  // Проверяем, разблокирован ли USDT
  const isUsdtUnlocked = state.resources.usdt && state.resources.usdt.unlocked;
  
  if (unlockedResources.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Нет доступных ресурсов
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-0.5 text-xs flex-grow">
        {unlockedResources.map((resource, index) => (
          <React.Fragment key={resource.id}>
            <div className="py-1">
              <ResourceDisplay 
                resource={resource} 
                formattedValue={formattedValues[resource.id].value}
                formattedPerSecond={formattedValues[resource.id].perSecond}
              />
            </div>
            {index < unlockedResources.length - 1 && (
              <Separator className="my-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Кнопка заполнения USDT (только если USDT разблокирован) */}
      {isUsdtUnlocked && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFillUsdt} 
            className="w-full text-xs flex items-center justify-center"
          >
            <CircleDollarSign className="h-3 w-3 mr-1" />
            Full USDT (Тест)
          </Button>
        </div>
      )}
    </div>
  );
});

// Добавляем отображаемое имя для отладки
ResourceList.displayName = "ResourceList";

export default ResourceList;
