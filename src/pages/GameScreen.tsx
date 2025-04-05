import React, { useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { GameDispatch } from '@/context/types';
import { useI18nContext } from '@/context/I18nContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Home,
  Settings,
  BookOpen,
  Lightbulb,
  Users,
  TrendingUp,
  ShoppingCart,
  Coins,
  Gamepad2,
  Aperture
} from 'lucide-react';
import ResearchTab from '@/components/ResearchTab';
import EquipmentTab from '@/components/EquipmentTab';
import SpecializationTab from '@/components/SpecializationTab';
import ReferralTab from '@/components/ReferralTab';
import TradingTab from '@/components/TradingTab';
import { useUnlockStatus } from '@/systems/unlock/hooks/useUnlockManager';
import { forceCheckAllUnlocks } from '@/utils/unlockActions';
import { GameStateService } from '@/services/GameStateService';
import { getSafeGameId } from '@/utils/gameIdsUtils';

interface GameScreenProps {
  dispatch: GameDispatch;
}

const GameScreen: React.FC<GameScreenProps> = () => {
  const { state, dispatch, isPageVisible } = useGame();
  const { t } = useI18nContext();
  const [eventMessages, setEventMessages] = useState<string[]>([]);
  
  const handleAddEvent = (message: string, type: string) => {
    setEventMessages(prevMessages => [...prevMessages, message]);
  };
  
  const handleClearEvents = () => {
    setEventMessages([]);
  };
  
  // Безопасное получение идентификаторов функций
  const equipmentFeatureId = getSafeGameId('features', 'equipment', 'equipment');
  const researchFeatureId = getSafeGameId('features', 'research', 'research');
  const specializationFeatureId = getSafeGameId('features', 'specialization', 'specialization');
  
  // Безопасная проверка разблокировки функций
  const isEquipmentUnlocked = useUnlockStatus(equipmentFeatureId);
  const isResearchUnlocked = useUnlockStatus(researchFeatureId);
  const isSpecializationUnlocked = useUnlockStatus(specializationFeatureId);
  
  const handleForceCheckUnlocks = () => {
    const updatedState = forceCheckAllUnlocks(state);
    dispatch({ type: 'LOAD_GAME', payload: updatedState });
  };
  
  const handleSaveGame = () => {
    GameStateService.saveGame(state);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Column */}
      <div className="w-2/5 p-4 flex flex-col">
        {/* Resources Display */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">{t('ui.resources')}</h2>
          <div className="space-y-2">
            {Object.entries(state.resources).map(([key, resource]) => (
              resource.unlocked && (
                <div key={key} className="bg-white p-3 rounded shadow">
                  <div className="flex items-center justify-between">
                    <span>{t(`resources.${resource.id}`)}:</span>
                    <span>{resource.value.toFixed(2)}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-auto">
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="bg-gray-200 justify-center">
              <TabsTrigger value="home">
                <Home className="h-5 w-5" />
                <span className="sr-only">{t('tabs.home')}</span>
              </TabsTrigger>
              
              {isEquipmentUnlocked && (
                <TabsTrigger value="equipment">
                  <Aperture className="h-5 w-5" />
                  <span className="sr-only">{t('tabs.equipment')}</span>
                </TabsTrigger>
              )}
              
              {isResearchUnlocked && (
                <TabsTrigger value="research">
                  <Lightbulb className="h-5 w-5" />
                  <span className="sr-only">{t('tabs.research')}</span>
                </TabsTrigger>
              )}
              
              {isSpecializationUnlocked && (
                <TabsTrigger value="specialization">
                  <TrendingUp className="h-5 w-5" />
                  <span className="sr-only">{t('tabs.specialization')}</span>
                </TabsTrigger>
              )}
              
              {state.unlocks.referrals && (
                <TabsTrigger value="referrals">
                  <Users className="h-5 w-5" />
                  <span className="sr-only">{t('tabs.referrals')}</span>
                </TabsTrigger>
              )}
              
              {state.unlocks.trading && (
                <TabsTrigger value="trading">
                  <Coins className="h-5 w-5" />
                  <span className="sr-only">{t('tabs.trading')}</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="home" className="pt-4">
              <p>{t('content.home')}</p>
            </TabsContent>
            
            <TabsContent value="equipment" className="pt-4">
              <EquipmentTab onAddEvent={handleAddEvent} />
            </TabsContent>
            
            <TabsContent value="research" className="pt-4">
              <ResearchTab onAddEvent={handleAddEvent} />
            </TabsContent>
            
            <TabsContent value="specialization" className="pt-4">
              <SpecializationTab onAddEvent={handleAddEvent} />
            </TabsContent>
            
            <TabsContent value="referrals" className="pt-4">
              <ReferralTab onAddEvent={handleAddEvent} />
            </TabsContent>
            
            <TabsContent value="trading" className="pt-4">
              <TradingTab onAddEvent={handleAddEvent} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Column */}
      <div className="w-3/5 p-4 flex flex-col">
        {/* Content based on tab selection */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">{t('ui.content')}</h2>
          <div className="bg-white p-3 rounded shadow">
            {/* Content will be dynamically loaded here */}
            {/* Example: <p>Some content here...</p> */}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-auto">
          <h2 className="text-lg font-semibold mb-2">{t('ui.actions')}</h2>
          <div className="space-y-2">
            <Button onClick={() => dispatch({ type: 'APPLY_KNOWLEDGE' })}>{t('actions.applyKnowledge')}</Button>
            {state.unlocks.exchangeBtc && (
              <Button onClick={() => dispatch({ type: 'EXCHANGE_BTC' })}>{t('actions.exchangeBtc')}</Button>
            )}
            <Button onClick={handleForceCheckUnlocks}>Force Check Unlocks</Button>
            <Button onClick={handleSaveGame}>Save Game</Button>
          </div>
        </div>
      </div>
      
      {/* Event Log */}
      <div className="w-full p-4 bg-gray-200 text-sm">
        <h2 className="text-lg font-semibold mb-2">{t('ui.eventLog')}</h2>
        {eventMessages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
        <Button onClick={handleClearEvents}>Clear Events</Button>
      </div>
    </div>
  );
};

export default GameScreen;
