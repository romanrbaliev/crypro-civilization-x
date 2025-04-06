
import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/hooks/useGame';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import Header from '@/components/Header';
import { checkSupabaseConnection } from '@/api/connectionUtils';
import { useGameLoader } from '@/hooks/useGameLoader';
import { useGameSaveEvents } from '@/hooks/useGameSaveEvents';
import { useUnlockChecker } from '@/hooks/useUnlockChecker';
import { useGameStateUpdateService } from '@/hooks/useGameStateUpdateService';
import { Building, Lightbulb, Users, User } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import EquipmentTab from "@/components/EquipmentTab";
import ResearchTab from "@/components/ResearchTab";
import ReferralsTab from "@/components/ReferralsTab";
import { SpecializationTab } from "@/components/SpecializationTab";
import ResourceList from "@/components/ResourceList";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";
import { useTranslation } from "@/i18n";
import { getUnlocksFromState } from '@/utils/unlockHelper';
import { toast } from "@/hooks/use-toast";

const Game: React.FC = () => {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Загрузка...');
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resourceUpdateCounter, setResourceUpdateCounter] = useState(0); // Счетчик для обновления ресурсов
  const [lastActionTimestamp, setLastActionTimestamp] = useState(0); // Временная метка последнего действия пользователя
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  
  const { 
    loadedState, 
    isLoading, 
    gameInitialized, 
    setGameInitialized,
    loadError
  } = useGameLoader(hasConnection, setLoadingMessage);
  
  useGameStateUpdateService();
  
  useUnlockChecker();
  
  const unlocks = state.unlocks || getUnlocksFromState(state);
  
  const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
  const hasUnlockedResearch = Object.values(state.upgrades).some(u => u.unlocked || u.purchased);
  const hasUnlockedSpecialization = !!state.specialization;
  const hasUnlockedReferrals = state.upgrades.cryptoCommunity?.purchased === true;
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkSupabaseConnection();
        setHasConnection(connected);
        setConnectionError(null);
      } catch (error) {
        console.error("Ошибка при проверке соединения:", error);
        setConnectionError(error instanceof Error ? error : new Error(String(error)));
        setHasConnection(false);
      }
    };
    
    checkConnection();
    
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  useEffect(() => {
    if (loadedState) {
      dispatch({ type: 'LOAD_GAME', payload: loadedState });
    } else if (gameInitialized && !isLoading) {
      dispatch({ type: 'START_GAME' });
    }
  }, [loadedState, dispatch, gameInitialized, isLoading]);
  
  useGameSaveEvents(state, isLoading, hasConnection, gameInitialized);
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);
  
  // Отслеживание действий, которые должны вызывать мгновенное обновление
  useEffect(() => {
    // Создаем слушатель для перехвата событий изменения состояния
    const handleGameActionEvent = () => {
      // Обновляем временную метку последнего действия и счетчик
      setLastActionTimestamp(Date.now());
      setResourceUpdateCounter(prev => prev + 1);
    };
    
    // Добавляем прослушиватель событий
    if (typeof window !== 'undefined' && window.gameEventBus) {
      window.gameEventBus.addEventListener('resource-change', handleGameActionEvent);
      
      return () => {
        if (window.gameEventBus) {
          window.gameEventBus.removeEventListener('resource-change', handleGameActionEvent);
        }
      };
    }
  }, []);
  
  // Регулярное обновление отображения ресурсов (раз в 100мс) для автоматического накопления
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Проверяем, прошло ли достаточно времени с последнего действия пользователя
      const currentTime = Date.now();
      const timeSinceLastAction = currentTime - lastActionTimestamp;
      
      // Только если прошло больше 100мс с последнего действия, обновляем счетчик
      if (timeSinceLastAction > 100) {
        setResourceUpdateCounter(prev => prev + 1);
      }
    }, 100); // Обновляем раз в 100мс
    
    return () => clearInterval(updateInterval);
  }, [lastActionTimestamp]);
  
  const addEvent = (message: string, type: GameEvent["type"] = "info") => {
    const newEvent: GameEvent = {
      id: generateId(),
      timestamp: Date.now(),
      message,
      type
    };
    
    setEventLog(prev => {
      const isDuplicate = prev.slice(0, 5).some(
        event => event.message === message && Date.now() - event.timestamp < 3000
      );
      
      if (isDuplicate) {
        return prev;
      }
      
      return [newEvent, ...prev];
    });
  };
  
  useEffect(() => {
    const handleGameEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        const { message, type } = event.detail;
        addEvent(message, type);
      }
    };
    
    const handleDetailEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        const { message, type } = event.detail;
        addEvent(message, type);
      }
    };
    
    if (typeof window !== 'undefined' && window.gameEventBus) {
      window.gameEventBus.addEventListener('game-event', handleGameEvent);
      window.gameEventBus.addEventListener('game-event-detail', handleDetailEvent);
      
      return () => {
        if (window.gameEventBus) {
          window.gameEventBus.removeEventListener('game-event', handleGameEvent);
          window.gameEventBus.removeEventListener('game-event-detail', handleDetailEvent);
        }
      };
    }
  }, []);
  
  useEffect(() => {
    if (hasUnlockedBuildings) {
      setSelectedTab("equipment");
    } else if (hasUnlockedResearch) {
      setSelectedTab("research");
    } else if (hasUnlockedReferrals) {
      setSelectedTab("referrals");
    }
  }, [hasUnlockedBuildings, hasUnlockedResearch, hasUnlockedReferrals]);
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  const renderTabButton = (id: string, label: string, icon: React.ReactNode) => {
    return (
      <Button 
        variant={selectedTab === id ? "default" : "ghost"} 
        className="justify-start rounded-none section-title h-6 px-3"
        onClick={() => setSelectedTab(id)}
      >
        {icon}
        {label}
      </Button>
    );
  };
  
  if (isLoading) {
    return <LoadingScreen message={loadingMessage} />;
  }
  
  if (loadError) {
    // Используем модифицированный ErrorScreen для отображения деталей ошибки в виде всплывающего окна
    toast({
      title: "Ошибка загрузки игры",
      description: "Произошла ошибка при загрузке игровых данных. Пробуем запустить новую игру.",
      variant: "destructive",
    });
    
    // Инициализируем игру заново вместо показа экрана ошибки
    if (!gameInitialized) {
      setGameInitialized(true);
    }
  }
  
  if (!hasConnection && !gameInitialized) {
    // Показываем диалог вместо полноэкранного сообщения
    return (
      <ErrorScreen 
        title="Ошибка соединения" 
        description="Не удалось подключиться к серверу. Вы можете продолжить игру в автономном режиме, но прогресс не будет сохраняться на сервере."
        onRetry={() => window.location.reload()}
        errorType="connection"
        error={connectionError}
      />
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header prestigePoints={state.prestigePoints || 0} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2">
            <ResourceList resources={unlockedResources} updateCounter={resourceUpdateCounter} />
          </div>
          
          <div className="border-t mt-auto">
            <div className="flex flex-col">
              {hasUnlockedBuildings && renderTabButton("equipment", t('tabs.equipment'), <Building className="h-3 w-3 mr-2" />)}
              
              {hasUnlockedResearch && renderTabButton("research", t('tabs.research'), <Lightbulb className="h-3 w-3 mr-2" />)}
              
              {hasUnlockedSpecialization && renderTabButton("specialization", t('tabs.specialization'), <User className="h-3 w-3 mr-2" />)}
              
              {hasUnlockedReferrals && renderTabButton("referrals", t('tabs.referrals'), <Users className="h-3 w-3 mr-2" />)}
            </div>
          </div>
        </div>
        
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2 flex flex-col">
            <div className="flex-1 overflow-auto">
              {selectedTab === "equipment" && hasUnlockedBuildings && (
                <EquipmentTab onAddEvent={addEvent} />
              )}
              
              {selectedTab === "research" && hasUnlockedResearch && (
                <ResearchTab onAddEvent={addEvent} />
              )}
              
              {selectedTab === "specialization" && hasUnlockedSpecialization && (
                <SpecializationTab onAddEvent={addEvent} />
              )}
              
              {selectedTab === "referrals" && hasUnlockedReferrals && (
                <ReferralsTab onAddEvent={addEvent} />
              )}
            </div>
            
            <ActionButtons onAddEvent={addEvent} />
          </div>
        </div>
      </div>
      
      <div className="h-24 border-t bg-white flex-shrink-0">
        <EventLog events={eventLog} />
      </div>
    </div>
  );
};

export default Game;
