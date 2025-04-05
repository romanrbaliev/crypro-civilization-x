
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  
  return <GameLayout />;
};

export default GameScreen;
