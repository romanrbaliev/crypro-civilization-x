
import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';
import BuildingsTab from '@/components/BuildingsTab';
import ResearchList from '@/components/ResearchList';

const GameScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('equipment'); // 'equipment' или 'research'
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <GameLayout>
      {activeTab === 'equipment' && <BuildingsTab />}
      {activeTab === 'research' && <ResearchList />}
    </GameLayout>
  );
};

export default GameScreen;
