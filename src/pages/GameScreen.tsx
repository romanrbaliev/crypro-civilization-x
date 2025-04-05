import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Building, Lightbulb, Info, Trash2, Settings, Users, User } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
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
import ResearchContainer from "@/components/ResearchContainer";
import ReferralsTab from "@/components/ReferralsTab";
import SpecializationTab from "@/components/SpecializationTab";
import EquipmentTab from "@/components/EquipmentTab";
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
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useI18nContext();
  
  const featureIds = useMemo(() => ({
    equipment: gameIds?.features?.equipment || 'equipment',
    research: gameIds?.features?.research || 'research',
    specialization: gameIds?.features?.specialization || 'specialization',
    referrals: gameIds?.features?.referrals || 'referrals'
  }), []);
  
  const hasUnlockedEquipment = useUnlockStatus(featureIds.equipment);
  const hasUnlockedResearch = useUnlockStatus(featureIds.research);
  const hasUnlockedSpecialization = useUnlockStatus(featureIds.specialization);
  const hasUnlockedReferrals = useUnlockStatus(featureIds.referrals);
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);
  
  useEffect(() => {
    console.log("Текущие разблокированные функции:", 
      Object.entries(state.unlocks || {})
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(', '));
    
    dispatch({ type: "FORCE_RESOURCE_UPDATE" });
  }, [state.unlocks, dispatch]);
  
  useEffect(() => {
    const buildingsUnlocked = state.counters?.buildingsUnlocked;
    const buildingsUnlockedCount = buildingsUnlocked ? 
      (typeof buildingsUnlocked === 'number' ? 
        buildingsUnlocked : 
        (buildingsUnlocked?.value || 0)) : 0;
    
    console.log("GameScreen: Счетчик разблокированных зданий =", buildingsUnlockedCount);
    
    const buildings = state.buildings || {};
    const unlockedBuildings = Object.values(buildings).filter(b => b?.unlocked);
    
    console.log("GameScreen: Разблокированные здания:", unlockedBuildings.map(b => b.id));
    
    if (unlockedBuildings.length > 0 && !state.unlocks?.equipment) {
      if (featureIds.equipment) {
        dispatch({ 
          type: "UNLOCK_FEATURE", 
          payload: { featureId: featureIds.equipment } 
        });
      }
    }
  }, [state.buildings, state.unlocks, dispatch, featureIds.equipment]);
  
  const addEvent = useCallback((message: string, type: GameEvent["type"] = "info") => {
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
  }, []);
  
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
    
    return undefined;
  }, [addEvent]);
  
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
    const generatorCount = state.buildings?.generator?.count || 0;
    
    if (generatorCount > 0 && !state.unlocks?.research) {
      console.log("GameScreen: Принудительная проверка разблокировок при первичной загрузке");
      
      const unlockService = new UnlockService();
      const updatedState = unlockService.checkAllUnlocks(state);
      
      if (updatedState.unlocks?.research !== state.unlocks?.research) {
        console.log("GameScreen: Обнаружено изменение разблокировок, применяем");
        dispatch({ type: "FORCE_RESOURCE_UPDATE" });
      }
    }
  }, [state.buildings?.generator?.count, state.unlocks?.research, state, dispatch]);
  
  const handleResetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
    setResetConfirmOpen(false);
    addEvent(t('events.gameReset'), "info");
  }, [dispatch, addEvent, t]);
  
  const handleResetAll = useCallback(async () => {
    try {
      localStorage.clear();
      toast({
        title: t('ui.resetSuccess'),
        description: t('ui.resetSuccessDetail'),
        variant: "success",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: t('ui.resetError'),
        description: t('ui.resetErrorDetail'),
        variant: "destructive",
      });
    }
  }, [toast, t]);
  
  const renderTabButton = useCallback((id: string, labelKey: string, icon: React.ReactNode, isUnlocked: boolean) => {
    if (!isUnlocked) return null;
    
    return (
      <Button 
        variant={selectedTab === id ? "default" : "ghost"} 
        className="justify-start rounded-none section-title h-8 px-3 text-base"
        onClick={() => setSelectedTab(id)}
      >
        {icon}
        <span className="ml-2">{t(`tabs.${labelKey}`)}</span>
      </Button>
    );
  }, [selectedTab, t]);
  
  const tabContent = useMemo(() => ({
    equipment: hasUnlockedEquipment ? <EquipmentTab onAddEvent={addEvent} /> : null,
    research: hasUnlockedResearch ? <ResearchContainer onAddEvent={addEvent} /> : null,
    specialization: hasUnlockedSpecialization ? <SpecializationTab onAddEvent={addEvent} /> : null,
    referrals: hasUnlockedReferrals ? <ReferralsTab onAddEvent={addEvent} /> : null
  }), [hasUnlockedEquipment, hasUnlockedResearch, hasUnlockedSpecialization, hasUnlockedReferrals, addEvent]);
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b shadow-sm py-0.5 flex-shrink-0 h-10">
        <div className="flex justify-between items-center h-full">
          <div className="flex-1 flex items-center pl-2 gap-2">
            <UnlockStatusPopup />
          </div>
          <div className="flex items-center justify-between px-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-base h-8 px-3">
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
                    <h4 className="font-semibold text-base">{t('tutorial.startGame')}</h4>
                    <p className="text-base whitespace-pre-line">
                      {t('tutorial.startGameSteps')}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <h4 className="font-semibold text-base">{t('tutorial.resourcesTitle')}</h4>
                    <ul className="space-y-2 text-base">
                      <li><strong>{t('resources.knowledge')}</strong> - {t('tutorial.resourcesList.knowledge')}</li>
                      <li><strong>{t('resources.usdt')}</strong> - {t('tutorial.resourcesList.usdt')}</li>
                      <li><strong>{t('resources.electricity')}</strong> - {t('tutorial.resourcesList.electricity')}</li>
                      <li><strong>{t('resources.computingPower')}</strong> - {t('tutorial.resourcesList.computingPower')}</li>
                      <li><strong>{t('resources.reputation')}</strong> - {t('tutorial.resourcesList.reputation')}</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="buildings" className="space-y-4 mt-4">
                    <h4 className="font-semibold text-base">{t('tutorial.equipmentTitle')}</h4>
                    <ul className="space-y-2 text-base">
                      <li><strong>{t('buildings.practice.name')}</strong> - {t('tutorial.equipmentList.practice')}</li>
                      <li><strong>{t('buildings.generator.name')}</strong> - {t('tutorial.equipmentList.generator')}</li>
                      <li><strong>{t('buildings.homeComputer.name')}</strong> - {t('tutorial.equipmentList.homeComputer')}</li>
                      <li><strong>{t('buildings.cryptoWallet.name')}</strong> - {t('tutorial.equipmentList.cryptoWallet')}</li>
                      <li><strong>{t('buildings.internetChannel.name')}</strong> - {t('tutorial.equipmentList.internetChannel')}</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-base h-8 px-3">
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
                <Button variant="ghost" size="sm" className="text-base h-8 px-3">
                  <Settings className="h-4 w-4 mr-2" />
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
                  <h3 className="font-medium mb-2 text-base">{t('ui.language')}</h3>
                  <div className="flex gap-2 mb-4">
                    <LanguageSelector variant="outline" />
                  </div>
                  
                  <h3 className="font-medium mb-2 text-base">{t('ui.settings')}</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center text-base"
                      onClick={() => setResetConfirmOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('ui.resetProgress')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center text-base"
                      onClick={() => dispatch({ type: "FORCE_RESOURCE_UPDATE" })}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      {t('actions.checkUnlocks')}
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium mb-2 text-base">О игре</h3>
                  <p className="text-base text-gray-500 mb-4">
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
            <ResourceList />
          </div>
          
          <div className="border-t mt-auto">
            <div className="flex flex-col">
              {renderTabButton("equipment", "equipment", <Building className="h-4 w-4" />, hasUnlockedEquipment)}
              {renderTabButton("research", "research", <Lightbulb className="h-4 w-4" />, hasUnlockedResearch)}
              {renderTabButton("specialization", "specialization", <User className="h-4 w-4" />, hasUnlockedSpecialization)}
              {renderTabButton("referrals", "referrals", <Users className="h-4 w-4" />, hasUnlockedReferrals)}
            </div>
          </div>
        </div>
        
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2 flex flex-col">
            <div className="flex-1 overflow-auto">
              {selectedTab === "equipment" && tabContent.equipment}
              {selectedTab === "research" && tabContent.research}
              {selectedTab === "specialization" && tabContent.specialization}
              {selectedTab === "referrals" && tabContent.referrals}
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
