
import React, { useState, useEffect } from 'react';
import GameTopNav from '@/components/GameTopNav';
import ResourceList from '@/components/ResourceList';
import ActionButtons from '@/components/ActionButtons';
import EventLog, { GameEvent } from '@/components/EventLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EquipmentTab from '@/components/EquipmentTab';
import SynergyTab from '@/components/SynergyTab';
import ReferralsTab from '@/components/ReferralsTab';
import ResearchTab from '@/components/ResearchTab';
import { useGame } from '@/context/hooks/useGame';
import { dispatchGameEvent } from '@/context/utils/eventBusUtils';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  const [events, setEvents] = useState<GameEvent[]>([]);
  
  // Функция для добавления событий
  const handleAddEvent = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newEvent: GameEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      type
    };
    
    setEvents(prev => [newEvent, ...prev]);
    
    // Также отправляем событие в глобальную систему событий
    dispatchGameEvent(message, type);
  };
  
  // Получаем список разблокированных ресурсов
  const resources = Object.values(state.resources).filter(r => r.unlocked);
  
  return (
    <div className="flex flex-col h-full">
      <GameTopNav />
      
      <div className="flex flex-col flex-grow overflow-hidden">
        <ResourceList resources={resources} />
        
        <div className="flex-grow flex flex-col">
          <Tabs defaultValue="actions" className="flex-grow flex flex-col">
            <div className="px-4 py-2 border-t border-b bg-gray-50">
              <TabsList className="w-full justify-start overflow-x-auto pb-1 flex-wrap">
                <TabsTrigger value="actions">Действия</TabsTrigger>
                <TabsTrigger value="equipment">Оборудование</TabsTrigger>
                <TabsTrigger value="research">Исследования</TabsTrigger>
                <TabsTrigger value="synergy">Синергии</TabsTrigger>
                <TabsTrigger value="referrals">Рефералы</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <TabsContent value="actions" className="mt-0 h-full">
                <ActionButtons />
              </TabsContent>
              
              <TabsContent value="equipment" className="mt-0 h-full">
                <EquipmentTab onAddEvent={handleAddEvent} />
              </TabsContent>
              
              <TabsContent value="research" className="mt-0 h-full">
                <ResearchTab onAddEvent={handleAddEvent} />
              </TabsContent>
              
              <TabsContent value="synergy" className="mt-0 h-full">
                <SynergyTab onAddEvent={handleAddEvent} />
              </TabsContent>
              
              <TabsContent value="referrals" className="mt-0 h-full">
                <ReferralsTab onAddEvent={handleAddEvent} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <EventLog events={events} />
      </div>
    </div>
  );
};

export default GameScreen;
