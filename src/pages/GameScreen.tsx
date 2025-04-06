import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { useNavigate } from "react-router-dom";
import { Building, Lightbulb, Info, Trash2, Settings, Users, User } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import Header from "@/components/Header";
import EquipmentTab from "@/components/EquipmentTab";
import ResearchTab from "@/components/ResearchTab";
import ReferralsTab from "@/components/ReferralsTab";
import { SpecializationTab } from "@/components/SpecializationTab";
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

// Функция для сброса данных игры
const resetAllGameData = async () => {
  await clearAllSavedDataForAllUsers();
};

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  
  // Получаем объект unlocks из состояния для обратной совместимости
  const unlocks = state.unlocks || getUnlocksFromState(state);
  
  const hasUnlockedBuildings = Object.values(state.buildings).some(b => b.unlocked);
  const hasUnlockedResearch = Object.values(state.upgrades).some(u => u.unlocked || u.purchased);
  const hasUnlockedSpecialization = !!state.specialization;
  const hasUnlockedReferrals = state.upgrades.cryptoCommunity?.purchased === true;
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);
  
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b shadow-sm py-0.5 flex-shrink-0 h-8">
        <div className="flex justify-between items-center h-full">
          <div className="flex-1 flex items-center pl-2 gap-2">
          </div>
          <div className="flex items-center justify-between px-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  {t('tutorial.title')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('tutorial.title')}</DialogTitle>
                  <DialogDescription>
                    {t('tutorial.basics.intro')}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basics">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="basics">{t('tutorial.basics')}</TabsTrigger>
                    <TabsTrigger value="resources">{t('tutorial.resources')}</TabsTrigger>
                    <TabsTrigger value="buildings">{t('tutorial.buildings')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basics" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.basics.title')}</h4>
                    <p className="text-sm">
                      {t('tutorial.basics.intro')}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.resources.title')}</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>{t('resources.knowledge')}</strong> - {t('tutorial.resources.knowledge')}</li>
                      <li><strong>{t('resources.usdt')}</strong> - {t('tutorial.resources.usdt')}</li>
                      <li><strong>{t('resources.electricity')}</strong> - {t('tutorial.resources.electricity')}</li>
                      <li><strong>{t('resources.computingPower')}</strong> - {t('tutorial.resources.computingPower')}</li>
                      <li><strong>Репутация</strong> - {t('tutorial.resources.reputation')}</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="buildings" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.buildings.title')}</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>{t('buildings.practice')}</strong> - {t('tutorial.buildings.practice')}</li>
                      <li><strong>{t('buildings.generator')}</strong> - {t('tutorial.buildings.generator')}</li>
                      <li><strong>{t('buildings.homeComputer')}</strong> - {t('tutorial.buildings.homeComputer')}</li>
                      <li><strong>{t('buildings.cryptoWallet')}</strong> - {t('tutorial.buildings.cryptoWallet')}</li>
                      <li><strong>{t('buildings.internetChannel')}</strong> - {t('tutorial.buildings.internetChannel')}</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  {t('settings.resetProgress')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.resetConfirm.title')}</DialogTitle>
                  <DialogDescription>
                    {t('settings.resetConfirm.description')}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                    {t('settings.resetConfirm.cancel')}
                  </Button>
                  <Button variant="destructive" onClick={handleResetGame}>
                    {t('settings.resetConfirm.confirm')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  {t('settings.title')}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t('settings.title')}</SheetTitle>
                  <SheetDescription>
                    {t('settings.gameOptions')}
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">{t('settings.language')}</h3>
                  <div className="mb-4">
                    <LanguageSwitch />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium mb-2">{t('settings.gameOptions')}</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                      onClick={() => setResetConfirmOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('settings.resetProgress')}
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium mb-2">{t('settings.about')}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('settings.version')}<br />
                    © 2023 Crypto Civilization
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1"></div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2">
            <ResourceList resources={unlockedResources} />
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

export default GameScreen;
