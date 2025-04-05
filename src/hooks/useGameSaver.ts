
import { useEffect, useRef } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { saveGameToServer } from '@/api/gameStorage/saveGame';
import { safeDispatchGameEvent } from '@/context/utils/eventBusUtils';
import { convertGameState } from '@/utils/typeConverters';

export const useGameSaver = (autosaveInterval = 30000) => {
  const { state } = useGame();
  const lastSavedRef = useRef<number>(Date.now());
  
  // Функция ручного сохранения
  const saveGame = async () => {
    try {
      // Используем функцию-помощник для преобразования типов
      const typedState = convertGameState(state);
      const success = await saveGameToServer(typedState);
      
      if (success) {
        lastSavedRef.current = Date.now();
        safeDispatchGameEvent('Игра успешно сохранена', 'success');
        return true;
      } else {
        safeDispatchGameEvent('Не удалось сохранить игру', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      safeDispatchGameEvent('Ошибка при сохранении игры', 'error');
      return false;
    }
  };
  
  // Автосохранение с заданным интервалом
  useEffect(() => {
    if (!state.gameStarted) return;
    
    const intervalId = setInterval(() => {
      // Если прошло достаточно времени и игра запущена
      if (Date.now() - lastSavedRef.current >= autosaveInterval && state.gameStarted) {
        saveGame();
      }
    }, 5000); // Проверяем каждые 5 секунд
    
    return () => clearInterval(intervalId);
  }, [state.gameStarted, autosaveInterval]);
  
  return { saveGame, lastSaved: lastSavedRef.current };
};
