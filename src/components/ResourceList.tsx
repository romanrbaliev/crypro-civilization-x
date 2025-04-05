
import React from 'react';
import ResourceItem from './ResourceItem';
import { useGame } from '@/context/hooks/useGame';
import { useI18nContext } from '@/context/I18nContext';

const ResourceList: React.FC = () => {
  const { state } = useGame();
  const { t } = useI18nContext();
  
  // Получаем все разблокированные ресурсы
  const unlockedResources = Object.entries(state.resources)
    .filter(([_, resource]) => resource.unlocked)
    .map(([id, resource]) => ({ id, ...resource }));
  
  // Проверяем состояние ресурсов для отладки
  console.log('ResourceList: Состояние ресурсов:', 
    unlockedResources.map(r => `${r.id} (unlocked=${r.unlocked}, value=${r.value})`)
  );
  
  // Проверяем состояние USDT отдельно
  if (state.resources.usdt) {
    console.log('USDT status:', {
      exists: true,
      unlocked: state.resources.usdt.unlocked,
      value: state.resources.usdt.value,
      flagInUnlocks: state.unlocks.usdt
    });
  }
  
  if (unlockedResources.length === 0) {
    return (
      <div className="resources-list">
        <p className="text-gray-500">{t('resources.noResourcesUnlocked')}</p>
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
