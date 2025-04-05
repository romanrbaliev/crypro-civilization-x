
import React from 'react';
import ResourceCard from './ResourceCard';
import { Resource } from '@/context/types';

interface ResourceListProps {
  resources: Record<string, Resource>;
  filter?: string;
}

const ResourceList: React.FC<ResourceListProps> = ({ resources, filter }) => {
  // Фильтруем и сортируем ресурсы
  const filteredResources = Object.values(resources)
    .filter(resource => {
      if (!filter) return resource.unlocked;
      return resource.unlocked && resource.id.includes(filter);
    })
    .sort((a, b) => {
      // Сортировка по типу
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      // Затем по имени
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="resources-container">
      {filteredResources.length === 0 ? (
        <p className="text-center text-gray-500">Нет доступных ресурсов</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredResources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              resourceId={resource.id.toString()} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
