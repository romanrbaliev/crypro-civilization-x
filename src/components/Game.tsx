
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useNavigate } from 'react-router-dom';
import GameScreen from '@/pages/GameScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { checkSupabaseConnection } from '@/api/connectionUtils';
import { useGameLoader } from '@/hooks/useGameLoader';
import { useGameSaveEvents } from '@/hooks/useGameSaveEvents';
import { useUnlockChecker } from '@/hooks/useUnlockChecker';
import { useResourceSystem } from '@/hooks/useResourceSystem';

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Загрузка...');
  const { updateResources } = useResourceSystem();
  
  // Используем хук для загрузки игры
  const { 
    loadedState, 
    isLoading, 
    gameInitialized, 
    setGameInitialized 
  } = useGameLoader(hasConnection, setLoadingMessage);
  
  // Используем хук для автоматической проверки разблокировок
  useUnlockChecker();
  
  // Проверяем соединение с сервером
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setHasConnection(connected);
    };
    
    checkConnection();
    
    // Периодически проверяем соединение
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Загружаем сохраненное состояние
  useEffect(() => {
    if (loadedState) {
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
    } else if (gameInitialized && !isLoading) {
      // Если нет сохранения, запускаем новую игру
      dispatch({ type: 'START_GAME' });
    }
  }, [loadedState, dispatch, gameInitialized, isLoading]);
  
  // Настраиваем автосохранение
  useGameSaveEvents(state, isLoading, hasConnection, gameInitialized);
  
  // Игровой цикл
  useEffect(() => {
    if (!state.gameStarted || isLoading) return;
    
    const updateGameResources = () => {
      const now = Date.now();
      const deltaTime = now - state.lastUpdate;
      
      if (deltaTime >= 100) { // Минимальный интервал 100мс для обновления
        // Используем функцию из ResourceSystem для обновления ресурсов
        updateResources(deltaTime);
        
        // Отладочная информация
        console.log(`Игровой цикл: прошло ${deltaTime}мс, обновляем ресурсы`);
      }
    };
    
    // Обновляем ресурсы каждые 100ms
    const intervalId = setInterval(updateGameResources, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [state.gameStarted, state.lastUpdate, isLoading, dispatch, updateResources]);
  
  // Если игра загружается, показываем экран загрузки
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }
  
  // Если возникла ошибка загрузки, показываем экран ошибки
  if (!hasConnection && !gameInitialized) {
    return (
      <ErrorScreen 
        title="Ошибка соединения" 
        description="Не удалось подключиться к серверу. Проверьте ваше соединение с интернетом."
        onRetry={() => window.location.reload()}
        errorType="connection"
      />
    );
  }
  
  // Показываем игровой экран
  return <GameScreen />;
};

export default Game;
