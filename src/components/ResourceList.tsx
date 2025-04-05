
import React from 'react';
import ResourceItem from './ResourceItem';
import { useGame } from '@/context/hooks/useGame';
import { useI18nContext } from '@/context/I18nContext';
import { Resource } from '@/context/types';

interface ResourceListProps {
  resources?: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const { state } = useGame();
  const { t } = useI18nContext();
  
  // Получаем все разблокированные ресурсы
  const unlockedResources = resources || Object.entries(state.resources)
    .filter(([_, resource]) => resource.unlocked)
    .map(([id, resource]) => ({ id, ...resource }));
  
  if (unlockedResources.length === 0) {
    return (
      <div className="resources-list">
        <p className="text-gray-500 text-base">{t('ui.noUnlockedResources')}</p>
      </div>
    );
  }
  
  return (
    <div className="resources-list">
      {unlockedResources.map(resource => (
        <ResourceItem 
          key={resource.id} 
          resource={resource} 
          name={t(`resources.${resource.id}`)}
        />
      ))}
    </div>
  );
};

export default ResourceList;
