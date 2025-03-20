
import React from "react";
import { Resource } from "@/context/types";
import ResourceDisplay from "./ResourceDisplay";
import { Separator } from "@/components/ui/separator";

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        Нет доступных ресурсов
      </div>
    );
  }

  return (
    <div className="space-y-0.5 text-xs">
      {resources.map((resource, index) => (
        <React.Fragment key={resource.id}>
          <div className="py-1">
            <ResourceDisplay resource={resource} />
          </div>
          {index < resources.length - 1 && (
            <Separator className="my-0.5" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ResourceList;
