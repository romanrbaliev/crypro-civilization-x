
import { useContext } from 'react';
import { GameContext } from '../GameContext';
import { ReferralHelper } from '../types';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
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
    
    // После обновления помощников запускаем пересчет ресурсов
    setTimeout(() => {
      forceUpdate();
    }, 100);
  };
  
  return {
    ...context,
    forceUpdate,
    updateHelpers
  };
};
