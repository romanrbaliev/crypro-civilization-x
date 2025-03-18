
import React from 'react';
import GameTopNav from '@/components/GameTopNav';
import ResourceList from '@/components/ResourceList';
import ActionButtons from '@/components/ActionButtons';
import EventLog from '@/components/EventLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EquipmentTab from '@/components/EquipmentTab';
import SynergyTab from '@/components/SynergyTab';
import ReferralsTab from '@/components/ReferralsTab';
import ResearchTab from '@/components/ResearchTab';

const GameScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <GameTopNav />
      
      <div className="flex flex-col flex-grow overflow-hidden">
        <ResourceList />
        
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
                <EquipmentTab />
              </TabsContent>
              
              <TabsContent value="research" className="mt-0 h-full">
                <ResearchTab />
              </TabsContent>
              
              <TabsContent value="synergy" className="mt-0 h-full">
                <SynergyTab />
              </TabsContent>
              
              <TabsContent value="referrals" className="mt-0 h-full">
                <ReferralsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <EventLog />
      </div>
    </div>
  );
};

export default GameScreen;
