
import React from "react";
import { Resource } from "@/context/GameContext";
import { formatNumber } from "@/utils/helpers";
import { Separator } from "@/components/ui/separator";

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-medium mb-2">Ресурсы</h2>
      <div>
        {resources.map((resource, index) => (
          <React.Fragment key={resource.id}>
            {index > 0 && <Separator className="my-1" />}
            <div className="py-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium text-[0.65rem]">{resource.name}:</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[0.65rem]">
                    {formatNumber(resource.value)}
                    {resource.max !== Infinity && (
                      <span className="text-gray-500">
                        /{formatNumber(resource.max)}
                      </span>
                    )}
                  </div>
                  <div 
                    className={`text-[0.6rem] ${
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
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
