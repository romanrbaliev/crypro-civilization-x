
import React from "react";
import { Resource } from "@/context/GameContext";
import { formatNumber } from "@/utils/helpers";

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium mb-2">Ресурсы</h2>
      <div className="space-y-1">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm"
          >
            <div className="flex items-center">
              <span className="font-medium text-xs">{resource.name}:</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-xs">
                {formatNumber(resource.value)}
                {resource.max !== Infinity && (
                  <span className="text-gray-500">
                    /{formatNumber(resource.max)}
                  </span>
                )}
              </div>
              <div 
                className={`text-[10px] ${
                  resource.perSecond < 0 
                    ? 'text-red-500' 
                    : resource.perSecond > 0 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                }`}
              >
                {resource.perSecond !== 0 && (
                  resource.perSecond > 0 
                    ? `+${formatNumber(resource.perSecond)}/сек` 
                    : `${formatNumber(resource.perSecond)}/сек`
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
