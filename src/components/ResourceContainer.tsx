
import React from 'react';
import { Resource } from '@/context/types';
import { Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useResources } from '@/hooks/useResources';

interface ResourceContainerProps {
  resource: Resource;
  onClick?: () => void;
  className?: string;
}

export const ResourceContainer: React.FC<ResourceContainerProps> = ({ 
  resource, 
  onClick,
  className = ""
}) => {
  const { t } = useTranslation();
  const { formatValue } = useResources();
  
  // Получаем ключ перевода ресурса
  const resourceKey = `resources.${resource.id}` as any;
  
  return (
    <div 
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 
        flex justify-between items-center ${className} 
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div>
        <div className="text-sm font-medium">
          {t(resourceKey)}
        </div>
        <div className="text-lg font-semibold">
          {formatValue(resource.value, resource.id)}
          {resource.max !== Infinity && (
            <span className="text-xs text-gray-500">
              /{formatValue(resource.max, resource.id)}
            </span>
          )}
        </div>
      </div>
      
      {resource.perSecond !== 0 && (
        <div className={`px-2 py-1 rounded-md flex items-center text-xs
          ${resource.perSecond > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
          {resource.perSecond > 0 ? <TrendingUp size={12} className="mr-1" /> : <Zap size={12} className="mr-1" />}
          {formatValue(Math.abs(resource.perSecond), resource.id)}/{t('resources.perSecond')}
        </div>
      )}
    </div>
  );
};

export default ResourceContainer;
