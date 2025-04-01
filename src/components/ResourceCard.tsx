
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatResourceValue } from '@/utils/resourceFormatConfig';
import { Resource } from '@/context/types';
import { 
  CircleIcon, 
  SettingsIcon,
  ZapIcon,
  BrainIcon,
  DatabaseIcon,
  DollarSignIcon,
  HardDriveIcon,
  BitcoinIcon
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { id, name, value = 0, max = Infinity, perSecond = 0 } = resource;
  
  const getResourceIcon = (iconName: string) => {
    // Используем иконки из lucide-react напрямую
    const iconMap: { [key: string]: React.ReactNode } = {
      'circle': <CircleIcon className="h-4 w-4" />,
      'settings': <SettingsIcon className="h-4 w-4" />,
      'zap': <ZapIcon className="h-4 w-4" />,
      'brain': <BrainIcon className="h-4 w-4" />,
      'database': <DatabaseIcon className="h-4 w-4" />,
      'dollar': <DollarSignIcon className="h-4 w-4" />,
      'hardDrive': <HardDriveIcon className="h-4 w-4" />,
      'bitcoin': <BitcoinIcon className="h-4 w-4" />
    };
    
    return iconMap[iconName] || <CircleIcon className="h-4 w-4" />;
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
  
  // Безопасное форматирование значений
  const safeFormattedValue = formatResourceValue(value, id);
  const safeFormattedMax = max !== Infinity && max > 0 ? formatResourceValue(max, id) : "∞";
  const safeFormattedPerSecond = formatResourceValue(perSecond, id);
  
  return (
    <Card className="mb-2 bg-white relative">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.icon)}
            <span className="text-sm font-medium">{name}</span>
          </div>
          <div className="text-sm font-medium">
            {safeFormattedValue}
            {max !== Infinity && max > 0 && (
              <span className="text-gray-500 text-xs">
                /{safeFormattedMax}
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
            {perSecond >= 0 ? "+" : ""}{safeFormattedPerSecond}/сек
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
