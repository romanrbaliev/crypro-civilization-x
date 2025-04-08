import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Building, Lightbulb, Info, Trash2, Settings, Users, User, BookOpen } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import ResourceList from "@/components/ResourceList";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useTranslation } from "@/i18n";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, DialogTrigger, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { clearAllSavedDataForAllUsers } from "@/api/adminService";
import { getUnlocksFromState } from '@/utils/unlockHelper';
import EquipmentTab from "@/components/EquipmentTab";
import ResearchTab from "@/components/ResearchTab";
import ReferralsTab from "@/components/ReferralsTab";
import { SpecializationTab } from "@/components/SpecializationTab";
import Header from "@/components/Header";
import KnowledgeProductionMonitor from "@/components/KnowledgeProductionMonitor";
import { useGameUpdater } from "@/hooks/useGameUpdater";
import LearnButton from "@/components/buttons/LearnButton";

// Функция для сброса данных игры
const resetAllGameData = async () => {
  await clearAllSavedDataForAllUsers();
};

const GameScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  // Используем новый хук для обновления игры
  const gameUpdater = useGameUpdater();
  const { t } = useTranslation();
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [knowledgeMonitorOpen, setKnowledgeMonitorOpen] = useState(false);
  
  // Получаем объект unlocks из состояния для обратной совместимости
  const unlocks = state.unlocks || getUnlocksFromState(state);
  
  const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
  const hasUnlockedResearch = Object.values(state.upgrades).some(u => u.unlocked || u.purchased);
  const hasUnlockedSpecialization = !!state.specialization;
  const hasUnlockedReferrals = state.upgrades.cryptoCommunity?.purchased === true;
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);

  // Добавляем обработчик события для открытия монитора производства знаний
  useEffect(() => {
    const handleOpenKnowledgeMonitor = () => {
      setKnowledgeMonitorOpen(true);
    };

    window.addEventListener('open-knowledge-monitor', handleOpenKnowledgeMonitor);
    
    return () => {
      window.removeEventListener('open-knowledge-monitor', handleOpenKnowledgeMonitor);
    };
  }, []);
  
  useEffect(() => {
    console.log("Текущие разблокированные элементы:", 
      Object.entries(state.resources)
        .filter(([_, v]) => v.unlocked)
        .map(([k]) => `ресурс ${k}`).join(', ') + ", " +
      Object.entries(state.buildings)
        .filter(([_, v]) => v.unlocked)
        .map(([k]) => `здание ${k}`).join(', ') + ", " +
      Object.entries(state.upgrades)
        .filter(([_, v]) => v.unlocked || v.purchased)
        .map(([k]) => `исследование ${k}`).join(', ')
    );
    console.log("Вкладка исследований разблокирована:", hasUnlockedResearch);
  }, [state.resources, state.buildings, state.upgrades, hasUnlockedResearch]);
  
  // Эффект для принудительной проверки разблокировок при изменении зданий
  useEffect(() => {
    const buildingCounts = Object.values(state.buildings).map(b => b.count).join(',');
    if (buildingCounts !== '0,0,0,0,0,0,0,0,0,0') {
      console.log("Изменились количества зданий, проверяем раблокировки");
      dispatch({ type: "CHECK_UNLOCKS" });
    }
  }, [Object.values(state.buildings).map(b => b.count).join(','), dispatch]);
  
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
    
    console.log("Обновление выбранной вкладки:", {
      hasUnlockedBuildings,
      hasUnlockedResearch,
      hasUnlockedReferrals,
      selectedTab
    });
  }, [hasUnlockedBuildings, hasUnlockedResearch, hasUnlockedReferrals]);
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
    setResetConfirmOpen(false);
    addEvent("Игра полностью сброшена", "info");
  };
  
  const handleResetAll = async () => {
    try {
      await resetAllGameData();
      toast({
        title: "Сброс выполнен",
        description: "Все сохранения успешно удалены. Страница будет перезагружена.",
        variant: "success",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: "Ошибка сброса",
        description: "Не удалось удалить сохранения игры.",
        variant: "destructive",
      });
    }
  };
  
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
  
  return (
    <div className="h-full flex flex-col">
      {/* Верхняя панель с ресурсами */}
      <Header 
        prestigePoints={state.prestigePoints || 0} 
      />
      
      {/* Основной контент */}
      <div className="flex-grow flex overflow-hidden">
        {/* Левая панель с основными действиями */}
        <div className="w-1/4 min-w-[200px] border-r border-gray-200 flex flex-col">
          {/* Панель с действиями */}
          <div className="p-2 flex-grow overflow-auto">
            <LearnButton />
            <ActionButtons onAddEvent={addEvent} />
          </div>
          
          {/* Панель с ресурсами */}
          <div className="border-t border-gray-200 p-2 h-2/5 overflow-auto">
            <ResourceList resources={Object.values(state.resources)} />
          </div>
        </div>
        
        {/* Основная игровая область */}
        <div className="flex-grow p-2 overflow-auto">
          {/* Табы */}
          <Tabs defaultValue="equipment">
            <TabsList className="w-full flex justify-start">
              {hasUnlockedBuildings && (
                <TabsTrigger value="equipment">
                  <Building className="h-3 w-3 mr-2" />
                  {t('tabs.equipment')}
                </TabsTrigger>
              )}
              {hasUnlockedResearch && (
                <TabsTrigger value="research">
                  <Lightbulb className="h-3 w-3 mr-2" />
                  {t('tabs.research')}
                </TabsTrigger>
              )}
              {hasUnlockedSpecialization && (
                <TabsTrigger value="specialization">
                  <User className="h-3 w-3 mr-2" />
                  {t('tabs.specialization')}
                </TabsTrigger>
              )}
              {hasUnlockedReferrals && (
                <TabsTrigger value="referrals">
                  <Users className="h-3 w-3 mr-2" />
                  {t('tabs.referrals')}
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="equipment" className="h-full overflow-auto">
              <EquipmentTab onAddEvent={addEvent} />
            </TabsContent>
            
            <TabsContent value="research" className="h-full overflow-auto">
              <ResearchTab onAddEvent={addEvent} />
            </TabsContent>
            
            <TabsContent value="specialization" className="h-full overflow-auto">
              <SpecializationTab onAddEvent={addEvent} />
            </TabsContent>
            
            <TabsContent value="referrals" className="h-full overflow-auto">
              <ReferralsTab onAddEvent={addEvent} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Правая панель с журналом событий */}
        <div className="w-1/5 min-w-[200px] border-l border-gray-200 p-2 flex flex-col">
          <EventLog events={eventLog} />
        </div>
      </div>
      
      {/* Модальные окна */}
      
      {/* Компонент монитора производства знаний */}
      <KnowledgeProductionMonitor 
        open={knowledgeMonitorOpen} 
        onOpenChange={setKnowledgeMonitorOpen} 
      />
    </div>
  );
};

export default GameScreen;
