
import React, { ReactNode } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import ResourceSidebar from './ResourceSidebar';
import GameHeader from './GameHeader';
import { Home, FileText, Settings } from 'lucide-react';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const { state } = useGame();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <GameHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Левая колонка - ресурсы и информация */}
        <ResourceSidebar />
        
        {/* Правая колонка - основной контент */}
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </div>
      
      {/* Нижняя навигация для мобильных устройств */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t">
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-16">
            <TabsTrigger
              value="game"
              className="flex flex-col items-center justify-center py-2"
              onClick={() => navigate('/game')}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Игра</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="journal"
              className="flex flex-col items-center justify-center py-2"
              onClick={() => navigate('/journal')}
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Журнал</span>
            </TabsTrigger>
            
            <TabsTrigger
              value="settings"
              className="flex flex-col items-center justify-center py-2"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">Настройки</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default GameLayout;
