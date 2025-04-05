
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/context/GameContext';
import ResourcePanel from './ResourcePanel';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import ApplyKnowledgeButton from './buttons/ApplyKnowledgeButton';
import ApplyAllKnowledgeButton from './buttons/ApplyAllKnowledgeButton';
import SpecializationTab from './SpecializationTab';
import BuildingsTab from './BuildingsTab';

const GameInterface: React.FC = () => {
  const { state, dispatch } = useGame();

  const handleGetKnowledge = () => {
    dispatch({
      type: 'INCREMENT_RESOURCE',
      payload: { resourceId: 'knowledge', amount: 1 }
    });
    
    // Обновляем счетчик нажатий на кнопку знаний
    dispatch({
      type: 'INCREMENT_COUNTER',
      payload: { counterId: 'knowledgeClicks', amount: 1 }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Crypto Idle Game</h1>
      
      <ResourcePanel />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
            <h2 className="text-xl font-bold mb-4">Действия</h2>
            
            <div className="space-y-3">
              <Button 
                onClick={handleGetKnowledge} 
                className="w-full"
                variant="outline"
              >
                <Brain className="mr-2 h-5 w-5" /> Изучить крипту
              </Button>
              
              <ApplyKnowledgeButton />
              <ApplyAllKnowledgeButton />
            </div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Tabs defaultValue="buildings" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="buildings">Здания</TabsTrigger>
              <TabsTrigger value="research">Исследования</TabsTrigger>
              <TabsTrigger value="mining">Майнинг</TabsTrigger>
              <TabsTrigger value="specialization">Специализация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buildings" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <BuildingsTab />
            </TabsContent>
            
            <TabsContent value="research" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Исследования</h2>
              <p>Изучайте технологии для улучшения эффективности и открытия новых возможностей.</p>
              
              {/* Здесь будет список доступных исследований */}
            </TabsContent>
            
            <TabsContent value="mining" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold mb-4">Майнинг</h2>
              <p>Добывайте криптовалюту и управляйте своей майнинг-фермой.</p>
              
              {/* Здесь будет интерфейс майнинга */}
            </TabsContent>
            
            <TabsContent value="specialization" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <SpecializationTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
