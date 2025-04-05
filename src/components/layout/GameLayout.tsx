
import React, { ReactNode, useState } from 'react';
import GameHeader from './GameHeader';
import ResourceSidebar from './ResourceSidebar';
import ActionButtons from './ActionButtons';
import EventLog from '../EventLog';
import { useGame } from '@/context/hooks/useGame';
import { BuildingOutline, Lightbulb } from 'lucide-react';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState('equipment');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Верхняя панель с меню */}
      <GameHeader />
      
      {/* Основной контент */}
      <div className="flex flex-1 min-h-0">
        {/* Левая колонка (2/5 ширины) - ресурсы и вкладки */}
        <div className="w-2/5 border-r flex flex-col">
          {/* Ресурсы (отображаются сверху вниз) */}
          <div className="flex-1 overflow-auto">
            <ResourceSidebar />
          </div>
          
          {/* Вкладки (отображаются снизу вверх) */}
          <div className="border-t">
            <div className="p-0">
              <div 
                className={`py-3 px-4 border-b flex items-center ${activeTab === 'equipment' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveTab('equipment')}
              >
                <BuildingOutline className="mr-2 h-5 w-5" />
                <span className="text-sm">Оборудование</span>
              </div>
              
              {state.upgrades.blockchainBasics && state.upgrades.blockchainBasics.unlocked && (
                <div 
                  className={`py-3 px-4 border-b flex items-center ${activeTab === 'research' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => setActiveTab('research')}
                >
                  <Lightbulb className="mr-2 h-5 w-5" />
                  <span className="text-sm">Исследования</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Правая колонка (3/5 ширины) - основной контент */}
        <div className="w-3/5 flex flex-col">
          {/* Основной контент вкладки */}
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
          
          {/* Действия (отображаются снизу вверх) */}
          <div className="p-4 border-t">
            <ActionButtons />
          </div>
        </div>
      </div>
      
      {/* Журнал событий внизу на всю ширину */}
      <div className="border-t p-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-medium">Журнал событий</h3>
          <span className="text-gray-500 text-xs">{state.eventMessages ? Object.keys(state.eventMessages).length : 0} событий</span>
        </div>
        <div className="max-h-32 overflow-y-auto">
          <EventLog />
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
