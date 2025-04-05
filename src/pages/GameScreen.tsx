
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/context/hooks/useGame';
import ResourceDisplay from '@/components/ResourceDisplay';
import BuildingsTab from '@/components/BuildingsTab';
import ResearchTab from '@/components/ResearchTab';
import ActionButtons from '@/components/ActionButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnlockStatus } from '@/systems/unlock/hooks/useUnlockManager';
import { getSafeGameId } from '@/utils/gameIdsUtils';
import MainMenu from '@/components/MainMenu';
import EventLog from '@/components/EventLog';

// Определяем типы для пропсов
interface GameScreenProps {
  dispatch: React.Dispatch<any>;
}

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('buildings');

  // Проверяем разблокированы ли различные вкладки
  const isResearchUnlocked = useUnlockStatus(getSafeGameId('features', 'research'));
  const isTradingUnlocked = useUnlockStatus(getSafeGameId('features', 'trading'));
  const isSpecializationUnlocked = useUnlockStatus(getSafeGameId('features', 'specialization'));
  const isReferralsUnlocked = useUnlockStatus(getSafeGameId('features', 'referrals'));

  // Перенаправляем на главный экран если игра не запущена
  useEffect(() => {
    if (!state.gameStarted) {
      navigate('/');
    }
  }, [state.gameStarted, navigate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Верхняя панель */}
      <header className="bg-white shadow-sm p-2">
        <MainMenu />
      </header>

      {/* Основной контент */}
      <div className="flex flex-1 overflow-hidden">
        {/* Левая колонка (2/5 ширины) */}
        <div className="w-2/5 flex flex-col bg-white shadow-sm overflow-auto">
          {/* Ресурсы (сверху) */}
          <div className="p-4 border-b">
            <ResourceDisplay resources={state.resources} />
          </div>

          {/* Вкладки (снизу) */}
          <div className="flex-1 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                <TabsTrigger value="buildings">Здания</TabsTrigger>
                {isResearchUnlocked && <TabsTrigger value="research">Исследования</TabsTrigger>}
                {isSpecializationUnlocked && <TabsTrigger value="specialization">Специализации</TabsTrigger>}
                {isReferralsUnlocked && <TabsTrigger value="referrals">Рефералы</TabsTrigger>}
                {isTradingUnlocked && <TabsTrigger value="trading">Трейдинг</TabsTrigger>}
              </TabsList>

              <div className="flex-1 overflow-auto">
                <TabsContent value="buildings" className="h-full">
                  <BuildingsTab />
                </TabsContent>
                
                {isResearchUnlocked && (
                  <TabsContent value="research" className="h-full">
                    <ResearchTab />
                  </TabsContent>
                )}
                
                {/* Заглушки для остальных вкладок */}
                {isSpecializationUnlocked && (
                  <TabsContent value="specialization" className="h-full">
                    <div className="p-4 border rounded">
                      <h2 className="text-xl font-bold">Специализации</h2>
                      <p>Здесь будет контент для специализаций</p>
                    </div>
                  </TabsContent>
                )}
                
                {isReferralsUnlocked && (
                  <TabsContent value="referrals" className="h-full">
                    <div className="p-4 border rounded">
                      <h2 className="text-xl font-bold">Рефералы</h2>
                      <p>Здесь будет контент для рефералов</p>
                    </div>
                  </TabsContent>
                )}
                
                {isTradingUnlocked && (
                  <TabsContent value="trading" className="h-full">
                    <div className="p-4 border rounded">
                      <h2 className="text-xl font-bold">Трейдинг</h2>
                      <p>Здесь будет контент для трейдинга</p>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>

        {/* Правая колонка (3/5 ширины) */}
        <div className="w-3/5 flex flex-col bg-gray-50 overflow-hidden">
          {/* Основной контент вкладки */}
          <div className="flex-1 p-4 overflow-auto">
            {/* Контент будет генерироваться в зависимости от активной вкладки */}
            <div className="h-full">
              {activeTab === 'buildings' && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Информация о зданиях</h2>
                  <p>Здесь будет подробная информация о выбранных зданиях</p>
                </div>
              )}
              
              {activeTab === 'research' && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Информация об исследованиях</h2>
                  <p>Здесь будет подробная информация о выбранных исследованиях</p>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий внизу */}
          <div className="p-4 bg-white shadow-inner border-t">
            <ActionButtons />
          </div>
        </div>
      </div>

      {/* Журнал событий внизу */}
      <footer className="bg-white shadow-sm p-2 border-t">
        <EventLog />
      </footer>
    </div>
  );
};

export default GameScreen;
