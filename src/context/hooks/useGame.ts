
import { useContext } from 'react';
import { GameContext, GameDispatch } from '../GameContext';
import { GameAction, GameState } from '../types';

export function useGame(): {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  forceUpdate: () => void;
  isPageVisible: boolean;
} {
  const state = useContext(GameContext);
  const dispatch = useContext(GameDispatch);
  
  if (state === undefined || dispatch === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  // Функция для принудительного обновления состояния игры
  const forceUpdate = () => {
    // Обновляем ресурсы, что приведет к запуску всех проверок
    dispatch({ type: 'FORCE_RESOURCE_UPDATE' });
  };

  // Определяем видимость страницы
  const isPageVisible = typeof document !== 'undefined' ? !document.hidden : true;
  
  return { state, dispatch, forceUpdate, isPageVisible };
}
