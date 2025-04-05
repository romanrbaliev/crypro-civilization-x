
import React from 'react';
import { Resource } from '@/context/types';
import { formatNumber } from '@/utils/helpers';
import { Zap, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/i18n';

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
  
  // Функция для получения ключа перевода ресурса
  const getResourceTranslationKey = (resourceId: string): string => {
    // Мэппинг ID ресурсов в ключи перевода
    const resourceKeyMap: Record<string, string> = {
      'knowledge': 'resources.knowledge',
      'usdt': 'resources.usdt',
      'electricity': 'resources.electricity', 
      'computingPower': 'resources.computingPower',
      'bitcoin': 'resources.bitcoin'
    };
    
    return resourceKeyMap[resourceId] || `resources.${resourceId}`;
  };
  
  return (
    <div 
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 
        flex justify-between items-center ${className} 
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div>
        <div className="text-sm font-medium">
          {t(getResourceTranslationKey(resource.id) as any)}
        </div>
        <div className="text-lg font-semibold">
          {formatNumber(resource.value)}
          {resource.max !== Infinity && (
            <span className="text-xs text-gray-500">
              /{formatNumber(resource.max)}
            </span>
          )}
        </div>
      </div>
      
      {resource.perSecond !== 0 && (
        <div className={`px-2 py-1 rounded-md flex items-center text-xs
          ${resource.perSecond > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
          {resource.perSecond > 0 ? <TrendingUp size={12} className="mr-1" /> : <Zap size={12} className="mr-1" />}
          {formatNumber(resource.perSecond)}/{t('resources.perSecond')}
        </div>
      )}
    </div>
  );
};

export default ResourceContainer;
