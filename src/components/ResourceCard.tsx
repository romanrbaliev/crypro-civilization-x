
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/utils/helpers';
import { Resource } from '@/types/game';

export interface ResourceCardProps {
  resource: Resource;
  id: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, id }) => {
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{resource.name}</h3>
            <p>{formatNumber(resource.value, 2)}</p>
          </div>
          <div>
            <p>+{formatNumber(resource.perSecond, 2)}/сек</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
