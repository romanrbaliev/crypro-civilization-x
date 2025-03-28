
import { useContext, useEffect, useCallback } from 'react';
import { GameContext } from '../GameContext';
import { ReferralHelper } from '../types';
import { useFrequentUpdate } from '@/hooks/useFrequentUpdate';
import useVisibilityOptimizer from '@/hooks/useVisibilityOptimizer';

export const useGame = () => {
  // Оборачиваем в try-catch для отлова ошибок
  try {
    const context = useContext(GameContext);
    
    if (!context) {
      console.error('useGame вызван вне GameProvider!');
      throw new Error('useGame must be used within a GameProvider');
    }

    // Применяем оптимизатор видимости
    const isPageVisible = useVisibilityOptimizer();

    // Используем хук частого обновления для основного ресурса, 
    // передавая контекст напрямую вместо получения его заново
    const { setActive, isActive } = useFrequentUpdate({ 
      state: context.state, 
      dispatch: context.dispatch,
      resourceId: 'knowledge'
    });
    
    // Активируем/деактивируем частые обновления в зависимости от видимости страницы
    // Используем useEffect, чтобы избежать бесконечного цикла ререндеринга
    useEffect(() => {
      setActive(isPageVisible);
    }, [isPageVisible, setActive]);
    
    // Добавим удобную функцию для принудительного обновления состояния игры
    const forceUpdate = useCallback(() => {
      context.dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
    }, [context]);
    
    // Добавим функцию для обновления помощников из базы данных
    const updateHelpers = useCallback((updatedHelpers: ReferralHelper[]) => {
      context.dispatch({ 
        type: 'UPDATE_HELPERS', 
        payload: { updatedHelpers } 
      });
    }, [context]);
    
    // Функция для логирования состояния - добавим для отладки
    const logGameState = useCallback(() => {
      console.log("Текущее состояние игры:", context.state);
      if (context.state.resources.btc) {
        console.log("Состояние BTC:", {
          value: context.state.resources.btc.value,
          perSecond: context.state.resources.btc.perSecond,
          max: context.state.resources.btc.max,
          unlocked: context.state.resources.btc.unlocked
        });
      }
    }, [context.state]);
    
    return {
      ...context,
      forceUpdate,
      updateHelpers,
      isPageVisible,
      resourceUpdateActive: isActive,
      logGameState
    };
  } catch (error) {
    console.error('Критическая ошибка в useGame:', error);
    // В случае критической ошибки возвращаем заглушку, чтобы приложение не упало полностью
    // Это позволит отобразить сообщение об ошибке вместо белого экрана
    const errorState = {
      state: { error: true, message: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      dispatch: () => console.error('Dispatch недоступен из-за ошибки в useGame')
    };
    
    return {
      ...errorState,
      forceUpdate: () => {},
      updateHelpers: () => {},
      isPageVisible: true,
      resourceUpdateActive: false,
      logGameState: () => {}
    } as any; // Используем any только для обработки ошибок
  }
};
