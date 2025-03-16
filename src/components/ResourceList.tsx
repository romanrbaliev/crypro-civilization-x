
import React from "react";
import { formatNumber } from "@/utils/helpers";
import { Resource } from "@/context/GameContext";

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  return (
    <div className="space-y-2">
      {resources.map(resource => {
        const isNegative = resource.perSecond < 0;
        
        return (
          <div key={resource.id} className="border-b pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <span className="text-lg mr-2">{resource.icon}</span>
                <span className="resource-name">{resource.name}</span>
              </div>
              <div className="text-right">
                <div className="resource-value">
                  {Math.floor(resource.value)}/{resource.max !== Infinity ? Math.floor(resource.max) : '∞'}
                </div>
                {resource.perSecond !== 0 && (
                  <div className={`resource-per-second ${isNegative ? 'text-red-600' : ''}`}>
                    {isNegative ? '' : '+'}{resource.perSecond.toFixed(2)}/сек
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResourceList;
