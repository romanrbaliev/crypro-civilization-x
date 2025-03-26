
import { useContext } from 'react';
import { GameContext } from '../GameContext';
import { ReferralHelper } from '../types';
import { useFrequentUpdate } from '@/hooks/useFrequentUpdate';
import useVisibilityOptimizer from '@/hooks/useVisibilityOptimizer';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  // Применяем оптимизатор видимости
  const isPageVisible = useVisibilityOptimizer();

  // Используем хук частого обновления для основного ресурса, 
  // передавая контекст напрямую вместо получения его заново
  const { setActive } = useFrequentUpdate({ 
    state: context.state, 
    dispatch: context.dispatch,
    resourceId: 'knowledge'
  });
  
  // Активируем/деактивируем частые обновления в зависимости от видимости страницы
  setActive(isPageVisible);
  
  // Добавим удобную функцию для принудительного обновления состояния игры
  const forceUpdate = () => {
    context.dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };
  
  // Добавим функцию для обновления помощников из базы данных
  const updateHelpers = (updatedHelpers: ReferralHelper[]) => {
    context.dispatch({ 
      type: 'UPDATE_HELPERS', 
      payload: { updatedHelpers } 
    });
  };
  
  return {
    ...context,
    forceUpdate,
    updateHelpers,
    isPageVisible
  };
};
