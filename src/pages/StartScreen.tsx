
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { loadGame } from '@/utils/gameLoader';

const StartScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tryLoadGame = async () => {
      try {
        setIsLoading(true);
        const savedGame = await loadGame();
        
        if (savedGame) {
          dispatch({ type: 'LOAD_GAME', payload: savedGame });
          console.log('Игра успешно загружена');
        }
      } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить сохраненную игру.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    tryLoadGame();
  }, [dispatch, toast]);

  const handleStartGame = () => {
    if (!state.gameStarted) {
      dispatch({ type: 'START_GAME' });
    }
    navigate('/game');
  };

  // Обработка нажатия на кнопку приветствия
  const handleWelcomeClick = () => {
    const clickCount = typeof state.counters.welcomeClicks === 'object' 
      ? state.counters.welcomeClicks.value || 0 
      : (state.counters.welcomeClicks || 0);
    
    // Увеличиваем счетчик на 1
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: {
        counterId: 'welcomeClicks',
        value: 1
      }
    });
    
    // Показываем разные сообщения в зависимости от количества кликов
    if (clickCount === 4) {
      toast({
        title: "Скрытый режим активирован",
        description: "Вы разблокировали режим разработчика!",
        variant: "success",
      });
    } else if (clickCount > 4 && clickCount < 10) {
      toast({
        description: `Еще ${10 - clickCount} нажатий до супер-режима!`,
      });
    } else if (clickCount === 10) {
      toast({
        title: "СУПЕР-РЕЖИМ АКТИВИРОВАН!",
        description: "Добро пожаловать в супер-секретный режим разработчика!",
        variant: "success",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-800" onClick={handleWelcomeClick}>
          Crypto Civilization
        </h1>
        <p className="mb-8 text-gray-600">
          Постройте свою криптовалютную империю
        </p>
        
        <Button 
          onClick={handleStartGame}
          className="w-full py-6" 
          disabled={isLoading}
        >
          {isLoading ? "Загрузка..." : (state.gameStarted ? "Продолжить игру" : "Начать игру")}
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
