
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import ResourceList from '@/components/ResourceList';

const ResourcesPanel: React.FC = () => {
  const { state } = useGame();
  const resources = Object.values(state.resources).filter(r => r.unlocked);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Ресурсы</h2>
      <ResourceList resources={resources} />
    </div>
  );
};

export default ResourcesPanel;
