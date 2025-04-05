
import React, { ReactNode, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useNavigate } from 'react-router-dom';
import ResourceSidebar from './ResourceSidebar';
import GameHeader from './GameHeader';
import BuildingsTab from '../BuildingsTab';
import ResearchList from '../ResearchList';
import ActionButtons from './ActionButtons';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { state } = useGame();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('equipment'); // equipment или research
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <GameHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Левая колонка - ресурсы и информация */}
        <ResourceSidebar />
        
        {/* Правая колонка - основной контент */}
        <div className="flex-1 p-4 overflow-auto flex flex-col">
          {/* Основной контент */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'equipment' && <BuildingsTab />}
            {activeTab === 'research' && <ResearchList />}
          </div>
          
          {/* Кнопки действий внизу */}
          <div className="mt-4">
            <ActionButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
