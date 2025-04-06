
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
  updateCounter?: number;
}

// Используем memo для предотвращения лишних перерисовок
const ResourceList: React.FC<ResourceListProps> = memo(({ resources, updateCounter }) => {
  const { dispatch, state } = useGame();
  const { formatValue } = useResourceSystem();
  
  // Фильтруем только разблокированные ресурсы
  const unlockedResources = useMemo(() => 
    resources.filter(resource => resource.unlocked), 
    [resources]
  );
  
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
  
  if (unlockedResources.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Нет доступных ресурсов
      </div>
    );
  }

  // Проверяем, разблокирован ли USDT
  const isUsdtUnlocked = state.resources.usdt && state.resources.usdt.unlocked;

  // Мемоизируем отформатированные значения ресурсов для предотвращения лишних вычислений
  const formattedResourceValues = useMemo(() => {
    return unlockedResources.map(resource => ({
      id: resource.id,
      formattedValue: formatValue(resource.value ?? 0, resource.id),
      formattedPerSecond: formatValue(resource.perSecond ?? 0, resource.id)
    }));
  }, [unlockedResources, formatValue, updateCounter]);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-0.5 text-xs flex-grow">
        {unlockedResources.map((resource, index) => {
          const formatted = formattedResourceValues.find(r => r.id === resource.id);
          return (
            <React.Fragment key={resource.id}>
              <div className="py-1">
                <ResourceDisplay 
                  resource={resource}
                  formattedValue={formatted?.formattedValue}
                  formattedPerSecond={formatted?.formattedPerSecond}
                />
              </div>
              {index < unlockedResources.length - 1 && (
                <Separator className="my-0.5" />
              )}
            </React.Fragment>
          );
        })}
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
}, (prevProps, nextProps) => {
  // Упрощенное сравнение, учитывая только updateCounter
  return prevProps.updateCounter === nextProps.updateCounter;
});

// Добавляем отображаемое имя для отладки
ResourceList.displayName = "ResourceList";

export default ResourceList;
