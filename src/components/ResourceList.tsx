
import React from "react";
import { Resource } from "@/context/types";
import { formatNumber } from "@/utils/helpers";
import { formatResourceValue } from "@/utils/resourceFormatConfig";
import { useGame } from "@/context/hooks/useGame";
import { Button } from "@/components/ui/button";

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const { dispatch } = useGame();

  // Обработчик нажатия на кнопку Full USDT
  const handleFullUsdt = () => {
    dispatch({
      type: "INCREMENT_RESOURCE",
      payload: { resourceId: "usdt", amount: 999999 }
    });
  };
  
  return (
    <div className="space-y-2">
      {resources.map((resource) => (
        <div key={resource.id} className="p-2 border rounded-md bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-sm">{resource.name}</span>
              <div className="text-xs text-gray-500">{resource.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm" data-resource-id={resource.id}>
                {formatResourceValue(resource.value, resource.id)} 
                {resource.max !== undefined && 
                  <span className="text-gray-400">/{formatNumber(resource.max)}</span>
                }
              </div>
              {resource.perSecond !== undefined && resource.perSecond !== 0 && (
                <div className={`text-xs ${resource.perSecond > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {resource.perSecond > 0 ? '+' : ''}{formatResourceValue(resource.perSecond, resource.id)}/сек
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Временная кнопка для тестирования */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleFullUsdt}
        className="w-full mt-2 border-dashed border-gray-300"
      >
        Full USDT (Тест)
      </Button>
    </div>
  );
};

export default ResourceList;
