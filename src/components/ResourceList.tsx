
import React, { memo } from "react";
import { Resource } from "@/context/types";
import ResourceDisplay from "./ResourceDisplay";
import { Separator } from "@/components/ui/separator";

interface ResourceListProps {
  resources: Resource[];
}

// Используем memo для предотвращения лишних перерисовок
const ResourceList: React.FC<ResourceListProps> = memo(({ resources }) => {
  // Фильтруем только разблокированные ресурсы
  const unlockedResources = resources.filter(resource => resource.unlocked);
  
  if (unlockedResources.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Нет доступных ресурсов
      </div>
    );
  }

  return (
    <div className="space-y-0.5 text-xs">
      {unlockedResources.map((resource, index) => (
        <React.Fragment key={resource.id}>
          <div className="py-1">
            <ResourceDisplay resource={resource} />
          </div>
          {index < unlockedResources.length - 1 && (
            <Separator className="my-0.5" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

// Добавляем отображаемое имя для отладки
ResourceList.displayName = "ResourceList";

export default ResourceList;
