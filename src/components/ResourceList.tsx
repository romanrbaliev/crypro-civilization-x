
import React, { memo } from "react";
import { Resource } from "@/context/types";
import ResourceDisplay from "./ResourceDisplay";
import { Separator } from "@/components/ui/separator";
import { formatResourceValue } from "@/utils/resourceFormatConfig";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";
import { CircleDollarSign } from "lucide-react";

interface ResourceListProps {
  resources: Resource[];
}

// Используем memo для предотвращения лишних перерисовок
const ResourceList: React.FC<ResourceListProps> = memo(({ resources }) => {
  const { dispatch, state } = useGame();
  
  // Фильтруем только разблокированные ресурсы
  const unlockedResources = resources.filter(resource => resource.unlocked);
  
  // Заполнение USDT до максимального значения
  const handleFillUsdt = () => {
    if (state.resources.usdt && state.resources.usdt.unlocked) {
      // Используем максимальное значение USDT из состояния
      const maxUsdt = state.resources.usdt.max;
      
      dispatch({
        type: "INCREMENT_RESOURCE",
        payload: {
          resourceId: "usdt",
          amount: maxUsdt - state.resources.usdt.value
        }
      });
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

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-0.5 text-xs flex-grow">
        {unlockedResources.map((resource, index) => (
          <React.Fragment key={resource.id}>
            <div className="py-1">
              <ResourceDisplay 
                resource={resource} 
                formattedValue={formatResourceValue(resource.value, resource.id)}
                formattedPerSecond={formatResourceValue(resource.perSecond, resource.id)}
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
