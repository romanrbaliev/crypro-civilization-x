
import { useCallback } from 'react';
import { useGame } from '@/context/hooks/useGame';

export const useResourceManager = () => {
  const { state, dispatch } = useGame();
  
  // Функция пересчета производства ресурсов
  const recalculateProduction = useCallback(() => {
    // Отправляем action для пересчета производства
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  }, [dispatch]);
  
  // Функция добавления ресурса
  const addResource = useCallback((resourceId: string, amount: number) => {
    dispatch({ 
      type: 'INCREMENT_RESOURCE', 
      payload: { resourceId, amount } 
    });
  }, [dispatch]);
  
  // Функция применения знаний
  const applyKnowledge = useCallback(() => {
    dispatch({ type: 'APPLY_KNOWLEDGE' });
  }, [dispatch]);

  // Функция для обновления ресурсов - добавляем для исправления ошибки в useGameUpdater.ts
  const updateResources = useCallback(() => {
    const currentTime = Date.now();
    dispatch({ 
      type: 'TICK', 
      payload: { currentTime } 
    });
  }, [dispatch]);
  
  return {
    resources: state.resources,
    recalculateProduction,
    addResource,
    applyKnowledge,
    updateResources
  };
};
