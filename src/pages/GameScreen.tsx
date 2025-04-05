
import React from 'react';
import { GameProvider } from '@/context/GameContext';
import MainMenu from '@/components/MainMenu';
import ResourceList from '@/components/ResourceList';
import BuildingList from '@/components/BuildingList';
import LearnButton from '@/components/buttons/LearnButton';
import ApplyKnowledgeButton from '@/components/buttons/ApplyKnowledgeButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GameScreen: React.FC = () => {
  return (
    <GameProvider>
      <div className="max-w-lg mx-auto p-4 min-h-screen flex flex-col">
        <MainMenu />
        
        <div className="my-4">
          <ResourceList />
        </div>
        
        <div className="mb-4 space-y-2">
          <LearnButton />
          <ApplyKnowledgeButton />
        </div>
        
        <Tabs defaultValue="buildings" className="flex-grow">
          <TabsList className="w-full">
            <TabsTrigger value="buildings" className="flex-1">Здания</TabsTrigger>
            <TabsTrigger value="research" className="flex-1">Исследования</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">Статистика</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buildings" className="py-4">
            <BuildingList />
          </TabsContent>
          
          <TabsContent value="research" className="py-4">
            <h2 className="text-xl font-bold mb-3">Исследования</h2>
            <p className="text-gray-500">Исследования будут доступны позже</p>
          </TabsContent>
          
          <TabsContent value="stats" className="py-4">
            <h2 className="text-xl font-bold mb-3">Статистика</h2>
            <p className="text-gray-500">Статистика будет доступна позже</p>
          </TabsContent>
        </Tabs>
      </div>
    </GameProvider>
  );
};

export default GameScreen;
