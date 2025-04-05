
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { useNavigate } from "react-router-dom";
import { Building, Lightbulb, Info, Trash2, Settings, Users, User } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import Header from "@/components/Header";
import EquipmentTab from "@/components/EquipmentTab";
import ResearchContainer from "@/components/ResearchContainer";
import ReferralsTab from "@/components/ReferralsTab";
import SpecializationTab from "@/components/SpecializationTab";
import ResourceList from "@/components/ResourceList";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";
import { useUnlockStatus } from "@/systems/unlock/hooks/useUnlockManager";
import { UnlockService } from "@/services/UnlockService";
import { useToast } from "@/hooks/use-toast";
import UnlockStatusPopup from "@/components/UnlockStatusPopup";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18nContext } from "@/context/I18nContext";
import { gameIds } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useI18nContext();
  
  // Используем унифицированные ID для проверки разблокировок
  const hasUnlockedEquipment = useUnlockStatus(gameIds.features.equipment);
  const hasUnlockedResearch = useUnlockStatus(gameIds.features.research);
  const hasUnlockedSpecialization = useUnlockStatus(gameIds.features.specialization);
  const hasUnlockedReferrals = useUnlockStatus(gameIds.features.referrals);
  
  console.log("GameScreen: Состояние вкладок:", {
    equipment: hasUnlockedEquipment,
    research: hasUnlockedResearch,
    specialization: hasUnlockedSpecialization,
    referrals: hasUnlockedReferrals
  });
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);
  
  useEffect(() => {
    console.log("Текущие разблокированные функции:", Object.entries(state.unlocks).filter(([_, v]) => v).map(([k]) => k).join(', '));
    
    dispatch({ type: "FORCE_RESOURCE_UPDATE" });
  }, [state.unlocks, dispatch]);
  
  useEffect(() => {
    const buildingsUnlockedCount = state.counters.buildingsUnlocked ? 
      (typeof state.counters.buildingsUnlocked === 'number' ? 
        state.counters.buildingsUnlocked : 
        state.counters.buildingsUnlocked.value) : 0;
    
    console.log("GameScreen: Счетчик разблокированных зданий =", buildingsUnlockedCount);
    
    const unlockedBuildings = Object.values(state.buildings).filter(b => b.unlocked);
    console.log("GameScreen: Разблокированные здания:", unlockedBuildings.map(b => b.id));
    
    if (unlockedBuildings.length > 0 && !state.unlocks.equipment) {
      console.log("GameScreen: Принудительная разблокировка вкладки оборудования");
      dispatch({ 
        type: "UNLOCK_FEATURE", 
        payload: { featureId: gameIds.features.equipment } 
      });
    }
  }, [state.buildings, state.unlocks.equipment, dispatch]);
  
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
    if (hasUnlockedEquipment) {
      setSelectedTab("equipment");
    } else if (hasUnlockedResearch) {
      setSelectedTab("research");
    } else if (hasUnlockedReferrals) {
      setSelectedTab("referrals");
    }
  }, [hasUnlockedEquipment, hasUnlockedResearch, hasUnlockedReferrals]);
  
  useEffect(() => {
    if (state.buildings.generator?.count > 0 && !state.unlocks.research) {
      console.log("GameScreen: Принудительная проверка разблокировок при первичной загрузке");
      
      const unlockService = new UnlockService();
      const updatedState = unlockService.checkAllUnlocks(state);
      
      if (updatedState.unlocks.research !== state.unlocks.research) {
        console.log("GameScreen: Обнаружено изменение разблокировок, применяем");
        dispatch({ type: "FORCE_RESOURCE_UPDATE" });
      }
    }
  }, []);
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
    setResetConfirmOpen(false);
    addEvent(t('events.gameReset') as string, "info");
  };
  
  const handleResetAll = async () => {
    try {
      localStorage.clear();
      toast({
        title: t('ui.resetSuccess') as string,
        description: t('ui.resetSuccessDetail') as string,
        variant: "success",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: t('ui.resetError') as string,
        description: t('ui.resetErrorDetail') as string,
        variant: "destructive",
      });
    }
  };
  
  const renderTabButton = (id: string, labelKey: string, icon: React.ReactNode, isUnlocked: boolean) => {
    if (!isUnlocked) return null;
    
    return (
      <Button 
        variant={selectedTab === id ? "default" : "ghost"} 
        className="justify-start rounded-none section-title h-6 px-3"
        onClick={() => setSelectedTab(id)}
      >
        {icon}
        {t(`tabs.${labelKey}`)}
      </Button>
    );
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b shadow-sm py-0.5 flex-shrink-0 h-8">
        <div className="flex justify-between items-center h-full">
          <div className="flex-1 flex items-center pl-2 gap-2">
            <UnlockStatusPopup />
          </div>
          <div className="flex items-center justify-between px-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  {t('ui.howToPlay')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('tutorial.title')}</DialogTitle>
                  <DialogDescription>
                    {t('tutorial.description')}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basics">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="basics">{t('tutorial.basics')}</TabsTrigger>
                    <TabsTrigger value="resources">{t('tutorial.resources')}</TabsTrigger>
                    <TabsTrigger value="buildings">{t('tutorial.buildings')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basics" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.startGame')}</h4>
                    <p className="text-xs whitespace-pre-line">
                      {t('tutorial.startGameSteps')}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.resourcesTitle')}</h4>
                    <ul className="space-y-2 text-xs">
                      <li><strong>{t('resources.knowledge')}</strong> - {(t('tutorial.resourcesList.knowledge') as string)}</li>
                      <li><strong>{t('resources.usdt')}</strong> - {(t('tutorial.resourcesList.usdt') as string)}</li>
                      <li><strong>{t('resources.electricity')}</strong> - {(t('tutorial.resourcesList.electricity') as string)}</li>
                      <li><strong>{t('resources.computingPower')}</strong> - {(t('tutorial.resourcesList.computingPower') as string)}</li>
                      <li><strong>{t('resources.reputation')}</strong> - {(t('tutorial.resourcesList.reputation') as string)}</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="buildings" className="space-y-4 mt-4">
                    <h4 className="font-semibold">{t('tutorial.equipmentTitle')}</h4>
                    <ul className="space-y-2 text-xs">
                      <li><strong>{(t('buildings.practice.name') as string)}</strong> - {(t('tutorial.equipmentList.practice') as string)}</li>
                      <li><strong>{(t('buildings.generator.name') as string)}</strong> - {(t('tutorial.equipmentList.generator') as string)}</li>
                      <li><strong>{(t('buildings.homeComputer.name') as string)}</strong> - {(t('tutorial.equipmentList.homeComputer') as string)}</li>
                      <li><strong>{(t('buildings.cryptoWallet.name') as string)}</strong> - {(t('tutorial.equipmentList.cryptoWallet') as string)}</li>
                      <li><strong>{(t('buildings.internetChannel.name') as string)}</strong> - {(t('tutorial.equipmentList.internetChannel') as string)}</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  {t('ui.resetProgress')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('ui.resetProgress')}?</DialogTitle>
                  <DialogDescription>
                    {t('ui.resetConfirmation')}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                    {t('ui.cancel')}
                  </Button>
                  <Button variant="destructive" onClick={handleResetGame}>
                    {t('ui.confirm')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  {t('ui.settings')}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{t('ui.settings')}</SheetTitle>
                  <SheetDescription>
                    {t('ui.settings')}
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">{t('ui.language')}</h3>
                  <div className="flex gap-2 mb-4">
                    <LanguageSelector variant="outline" />
                  </div>
                  
                  <h3 className="font-medium mb-2">{t('ui.settings')}</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                      onClick={() => setResetConfirmOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('ui.resetProgress')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center"
                      onClick={() => dispatch({ type: "FORCE_RESOURCE_UPDATE" })}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      {t('actions.checkUnlocks')}
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium mb-2">О игре</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('ui.version')}: 0.1.0 (Альфа)<br />
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
            <ResourceList resources={Object.values(state.resources).filter(r => r.unlocked)} />
          </div>
          
          <div className="border-t mt-auto">
            <div className="flex flex-col">
              {renderTabButton("equipment", "equipment", <Building className="h-3 w-3 mr-2" />, hasUnlockedEquipment)}
              {renderTabButton("research", "research", <Lightbulb className="h-3 w-3 mr-2" />, hasUnlockedResearch)}
              {renderTabButton("specialization", "specialization", <User className="h-3 w-3 mr-2" />, hasUnlockedSpecialization)}
              {renderTabButton("referrals", "referrals", <Users className="h-3 w-3 mr-2" />, hasUnlockedReferrals)}
            </div>
          </div>
        </div>
        
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2 flex flex-col">
            <div className="flex-1 overflow-auto">
              {selectedTab === "equipment" && hasUnlockedEquipment && (
                <EquipmentTab onAddEvent={addEvent} />
              )}
              
              {selectedTab === "research" && hasUnlockedResearch && (
                <ResearchContainer onAddEvent={addEvent} />
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
