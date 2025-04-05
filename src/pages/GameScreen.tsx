
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';
import BuildingList from '@/components/BuildingList';
import ResearchList from '@/components/ResearchList';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState('equipment');
  
  // Эффект для установки активной вкладки на основе разблокированного контента
  useEffect(() => {
    // Если ничего не разблокировано, показываем оборудование
    if (!state.unlocks.research) {
      setActiveTab('equipment');
    }
  }, [state.unlocks]);
  
  return (
    <GameLayout>
      {activeTab === 'equipment' && <BuildingList />}
      {activeTab === 'research' && <ResearchList />}
    </GameLayout>
  );
};

export default GameScreen;
