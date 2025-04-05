
import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import GameLayout from '@/components/layout/GameLayout';
import BuildingList from '@/components/BuildingList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GameScreen: React.FC = () => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState('buildings');
  
  return (
    <GameLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="buildings">Здания</TabsTrigger>
          <TabsTrigger value="research">Исследования</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buildings" className="space-y-4">
          <BuildingList />
        </TabsContent>
        
        <TabsContent value="research" className="space-y-4">
          <h2 className="text-xl font-bold mb-3">Исследования</h2>
          <p className="text-gray-500">Исследования будут доступны позже</p>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <h2 className="text-xl font-bold mb-3">Статистика</h2>
          <p className="text-gray-500">Статистика будет доступна позже</p>
        </TabsContent>
      </Tabs>
    </GameLayout>
  );
};

export default GameScreen;
