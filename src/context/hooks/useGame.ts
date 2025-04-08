
import { useContext, useEffect } from 'react';
import { GameContext } from '../GameContext';
import { ReferralHelper } from '../types';
import useVisibilityOptimizer from '@/hooks/useVisibilityOptimizer';

export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    console.error("GameContext не найден. Убедитесь, что компонент находится внутри GameProvider");
    throw new Error('useGame must be used within a GameProvider');
  }

  // Применяем оптимизатор видимости
  const isPageVisible = useVisibilityOptimizer();
  
  // Добавим удобную функцию для принудительного обновления состояния игры
  const forceUpdate = () => {
    console.log("Принудительное обновление ресурсов");
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
    isPageVisible,
    resourceUpdateActive: false // Всегда возвращаем false, так как useFrequentUpdate больше не используется
  };
};
