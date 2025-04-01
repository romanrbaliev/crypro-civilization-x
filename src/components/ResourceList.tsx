
import React, { useState } from 'react';
import { Resource } from '@/context/types';
import ResourceCard from './ResourceCard';
import ResourceDisplay from './ResourceDisplay';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const [expandedView, setExpandedView] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  
  // Отображаем ресурсы в зависимости от выбранного вида
  const sortedResources = [...resources].sort((a, b) => {
    // Сортировка: сначала основные ресурсы (knowledge, usdt), затем остальные
    const order = { knowledge: 1, usdt: 2, electricity: 3, computingPower: 4, bitcoin: 5 };
    
    const aOrder = order[a.id as keyof typeof order] || 10;
    const bOrder = order[b.id as keyof typeof order] || 10;
    
    return aOrder - bOrder;
  });

  const toggleExpandedView = () => {
    setExpandedView(!expandedView);
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  // Функция для фильтрации важных ресурсов (в компактном режиме)
  const isPrimaryResource = (resource: Resource): boolean => {
    return ['knowledge', 'usdt', 'electricity', 'computingPower', 'bitcoin'].includes(resource.id);
  };

  // Фильтруем ресурсы для компактного отображения (только основные)
  const displayedResources = expandedView 
    ? sortedResources 
    : sortedResources.filter(r => isPrimaryResource(r) || selectedResources.includes(r.id));

  return (
    <div className="resource-list">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">Ресурсы</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 py-0"
          onClick={toggleExpandedView}
        >
          {expandedView ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="space-y-1">
        {expandedView ? (
          // Расширенное отображение
          displayedResources.map((resource) => (
            <div key={resource.id} className="resource-item">
              <ResourceCard resource={resource} />
            </div>
          ))
        ) : (
          // Компактное отображение
          displayedResources.map((resource) => (
            <div key={resource.id} className="border rounded p-1.5 mb-1 bg-white resource-item">
              <ResourceDisplay resource={resource} />
            </div>
          ))
        )}
      </div>
      
      {!expandedView && sortedResources.length > displayedResources.length && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs mt-1 h-6"
          onClick={toggleExpandedView}
        >
          Показать все ресурсы ({sortedResources.length - displayedResources.length})
        </Button>
      )}
    </div>
  );
};

export default ResourceList;
