import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import ResourceCard from './ResourceCard';

const ResourceList: React.FC = () => {
  const { state } = useGame();

  // Исправленный рендер ресурса в списке
  const renderResourceItems = () => {
    return Object.entries(state.resources)
      .filter(([, resource]) => resource.unlocked)
      .map(([id, resource]) => (
        <ResourceCard 
          key={id} 
          resource={resource} 
          id={id}
        />
      ));
  };

  return (
    <div>
      {renderResourceItems()}
    </div>
  );
};

export default ResourceList;
