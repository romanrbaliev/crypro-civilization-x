
import React from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';
import BuildingList from '@/components/BuildingList';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  
  return (
    <GameLayout>
      <BuildingList />
    </GameLayout>
  );
};

export default GameScreen;
