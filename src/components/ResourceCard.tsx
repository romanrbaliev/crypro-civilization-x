
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatResourceValue } from '@/utils/resourceFormatConfig';
import { Resource } from '@/context/types';
import { Icons } from './icons';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { id, name, value, max, perSecond } = resource;
  
  const getResourceIcon = (iconName: string) => {
    // Получаем компонент иконки, если он существует в Icons
    const IconComponent = Icons[iconName] || Icons.circle;
    return <IconComponent className="h-4 w-4" />;
  };
  
  const getProgressBarColor = () => {
    if (max === Infinity || max === 0) return 'bg-blue-500';
    
    const ratio = value / max;
    if (ratio < 0.25) return 'bg-green-500';
    if (ratio < 0.5) return 'bg-lime-500';
    if (ratio < 0.75) return 'bg-yellow-500'; 
    if (ratio < 0.9) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getProgressPercentage = () => {
    if (max === Infinity || max === 0) return 0;
    const percentage = (value / max) * 100;
    return Math.min(percentage, 100); // Не более 100%
  };
  
  return (
    <Card className="mb-2 bg-white relative">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.icon)}
            <span className="text-sm font-medium">{name}</span>
          </div>
          <div className="text-sm font-medium">
            {formatResourceValue(value, id)}
            {max !== Infinity && max > 0 && (
              <span className="text-gray-500 text-xs">
                /{formatResourceValue(max, id)}
              </span>
            )}
          </div>
        </div>
        
        {max !== Infinity && max > 0 && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressBarColor()}`} 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}
        
        <div className="flex justify-between items-center mt-1 text-xs">
          <span className="text-gray-500">Производство:</span>
          <span className={perSecond >= 0 ? "text-green-600" : "text-red-500"}>
            {perSecond >= 0 ? "+" : ""}{formatResourceValue(perSecond, id)}/сек
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
