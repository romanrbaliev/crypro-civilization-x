
import React, { ReactNode, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useNavigate } from 'react-router-dom';
import ResourceSidebar from './ResourceSidebar';
import GameHeader from './GameHeader';
import BuildingsTab from '../BuildingsTab';
import ResearchList from '../ResearchList';
import ActionButtons from './ActionButtons';
import EventLog from '../EventLog';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { state } = useGame();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'equipment' | 'research'>('equipment');
  
  const handleTabChange = (tab: 'equipment' | 'research') => {
    setActiveTab(tab);
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <GameHeader />
      
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Левая колонка - ресурсы и информация (2/5 ширины на десктопе) */}
        <div className="w-full md:w-2/5 overflow-y-auto border-r border-gray-200">
          <ResourceSidebar />
        </div>
        
        {/* Правая колонка - основной контент (3/5 ширины на десктопе) */}
        <div className="w-full md:w-3/5 flex flex-col overflow-hidden">
          {/* Вкладки для переключения */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-2 px-4 text-center ${activeTab === 'equipment' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => handleTabChange('equipment')}
            >
              Оборудование
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center ${activeTab === 'research' ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => handleTabChange('research')}
            >
              Исследования
            </button>
          </div>
          
          {/* Основной контент */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'equipment' && <BuildingsTab />}
            {activeTab === 'research' && <ResearchList />}
          </div>
          
          {/* Кнопки действий */}
          <div className="p-4 border-t border-gray-200">
            <ActionButtons />
          </div>
        </div>
      </div>
      
      {/* Журнал событий внизу на всю ширину экрана */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 h-32 overflow-y-auto">
        <h3 className="text-sm font-medium mb-2">Журнал событий</h3>
        <EventLog />
      </div>
    </div>
  );
};

export default GameLayout;
