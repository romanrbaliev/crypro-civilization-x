
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '@/pages/GameScreen';

const Game: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Перенаправляем на страницу GameScreen
    navigate('/game');
  }, [navigate]);

  // Возвращаем GameScreen напрямую, если перенаправление не сработало
  return <GameScreen />;
};

export default Game;
