
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ResourceList from '@/components/ResourceList';
import BuildingTab from '@/components/BuildingTab';
import ActionButtons from '@/components/ActionButtons';
import EquipmentTab from '@/components/EquipmentTab';
import ReferralsTab from '@/components/ReferralsTab';
import EventLog from '@/components/EventLog';
import ResearchTab from '@/components/ResearchTab';
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from '@/context/hooks/useGame';
import { Resource } from '@/context/types';
import { Users, Building2, Lightbulb, Clock, BarChart2 } from 'lucide-react';
import GameLevel from '@/components/GameLevel';
import { toast } from '@/hooks/use-toast';
import { isMobile } from '@/hooks/use-mobile';
import { syncHelperDataWithGameState } from '@/api/referral/referralHelpers';
import { getUserIdentifier } from '@/api/gameDataService';

// Тип для события
interface GameEvent {
  id: number;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [currentTab, setCurrentTab] = useState("buildings");
  const [userId, setUserId] = useState<string | null>(null);
  const [isHelperSyncRunning, setIsHelperSyncRunning] = useState(false);
  const mobile = isMobile();
  
  const updateSpeed = useRef<number>(mobile ? 500 : 250);
  const lastUpdateRef = useRef<number>(Date.now());
  const eventIdCounter = useRef<number>(0);
  
  // Функция для добавления события в журнал
  const addEvent = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newEvent: GameEvent = {
      id: eventIdCounter.current++,
      message,
      timestamp: new Date(),
      type
    };
    
    setEvents(prev => {
      // Ограничиваем количество событий до 100
      const updated = [newEvent, ...prev];
      if (updated.length > 100) {
        return updated.slice(0, 100);
      }
      return updated;
    });
  };
  
  // Обработка события изменения фазы
  const handlePhaseChange = (phase: number) => {
    dispatch({ type: 'SET_PHASE', payload: { phase } });
    
    // Отображаем сообщение в зависимости от фазы
    let message = '';
    switch(phase) {
      case 1:
        message = 'Начата фаза 1: Первые шаги';
        break;
      case 2:
        message = 'Начата фаза 2: Основы криптоэкономики';
        break;
      case 3:
        message = 'Начата фаза 3: Специализация';
        break;
      case 4:
        message = 'Начата фаза 4: Крипто-сообщество';
        break;
      case 5:
        message = 'Начата фаза 5: Расширенная крипто-экономика';
        break;
      default:
        message = `Начата фаза ${phase}`;
    }
    
    addEvent(message, 'success');
    
    // Показываем тост с сообщением
    toast({
      title: "Новая фаза!",
      description: message,
    });
  };
  
  // Эффект для периодического обновления ресурсов
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      
      dispatch({
        type: 'UPDATE_RESOURCES',
        payload: { deltaTime }
      });
      
      lastUpdateRef.current = now;
    }, updateSpeed.current);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);
  
  // Получение идентификатора пользователя
  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await getUserIdentifier();
        setUserId(id);
      } catch (error) {
        console.error('Ошибка при получении ID пользователя:', error);
      }
    };
    
    getUserId();
  }, []);
  
  // Обработка обновления помощников рефералов
  useEffect(() => {
    const handleRefreshReferrals = async () => {
      if (userId && !isHelperSyncRunning) {
        setIsHelperSyncRunning(true);
        try {
          await syncHelperDataWithGameState(userId, state);
        } catch (error) {
          console.error('Ошибка при синхронизации данных помощников:', error);
        } finally {
          setIsHelperSyncRunning(false);
        }
      }
    };
    
    window.addEventListener('refresh-referrals', handleRefreshReferrals);
    
    return () => {
      window.removeEventListener('refresh-referrals', handleRefreshReferrals);
    };
  }, [userId, state, isHelperSyncRunning]);
  
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <Header />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Отображение ресурсов */}
        <div className="p-2 border-b">
          <ResourceList resources={Object.values(state.resources).filter((r: Resource) => r.unlocked)} />
        </div>
        
        {/* Вкладки */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-5 p-0 h-12 rounded-none border-b">
            <TabsTrigger value="buildings" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none">
              <Building2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Здания</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none">
              <Lightbulb className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Исследования</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none">
              <BarChart2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Прогресс</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none">
              <Clock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Автоматизация</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-muted data-[state=active]:shadow-none rounded-none">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Рефералы</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="buildings" className="flex-1 overflow-auto m-0 p-0">
            <BuildingTab onAddEvent={addEvent} />
          </TabsContent>
          
          <TabsContent value="research" className="flex-1 overflow-auto m-0 p-0">
            <ResearchTab onAddEvent={addEvent} />
          </TabsContent>
          
          <TabsContent value="progress" className="flex-1 overflow-auto m-0 p-0">
            <GameLevel onPhaseChange={handlePhaseChange} />
          </TabsContent>
          
          <TabsContent value="equipment" className="flex-1 overflow-auto m-0 p-0">
            <EquipmentTab onAddEvent={addEvent} />
          </TabsContent>
          
          <TabsContent value="referrals" className="flex-1 overflow-auto m-0 p-0">
            <ReferralsTab onAddEvent={addEvent} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Кнопки действий */}
      <div className="border-t">
        <ActionButtons onAddEvent={addEvent} />
      </div>
      
      {/* Журнал событий */}
      <EventLog events={events} />
    </div>
  );
};

export default GameScreen;
