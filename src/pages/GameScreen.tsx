
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  
  // Передаем null children, так как GameLayout работает без внешнего контента
  return <GameLayout>
    {null}
  </GameLayout>;
};

export default GameScreen;
