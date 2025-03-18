
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import { useNavigate } from "react-router-dom";
import { Building, Lightbulb, Info, Trash2, Settings, Users } from "lucide-react";
import EventLog, { GameEvent } from "@/components/EventLog";
import { generateId } from "@/utils/helpers";
import Header from "@/components/Header";
import EquipmentTab from "@/components/EquipmentTab";
import ResearchTab from "@/components/ResearchTab";
import ReferralsTab from "@/components/ReferralsTab";
import ResourceList from "@/components/ResourceList";
import { Button } from "@/components/ui/button";
import ActionButtons from "@/components/ActionButtons";
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState("equipment");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const hasUnlockedBuildings = Object.values(state.buildings)
    .some(b => b.unlocked && b.id !== "practice");
    
  const hasUnlockedResearch = Object.values(state.upgrades)
    .some(u => u.unlocked);
  
  useEffect(() => {
    dispatch({ type: "START_GAME" });
  }, [dispatch]);
  
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
    }
  }, [hasUnlockedBuildings, hasUnlockedResearch]);
  
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  
  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
    setResetConfirmOpen(false); // Закрываем диалог после сброса
    addEvent("Игра полностью сброшена", "info");
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b shadow-sm py-0.5 flex-shrink-0 h-8">
        <div className="flex justify-between items-center h-full">
          <div className="flex-1"></div>
          <div className="flex items-center justify-between w-full px-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Как играть
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Как играть в Crypto Civilization</DialogTitle>
                  <DialogDescription>
                    Руководство по основным механикам игры
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basics">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="basics">Основы</TabsTrigger>
                    <TabsTrigger value="resources">Ресурсы</TabsTrigger>
                    <TabsTrigger value="buildings">Оборудование</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basics" className="space-y-4 mt-4">
                    <h4 className="font-semibold">Начало игры</h4>
                    <p className="text-sm">
                      1. Начните с изучения основ криптовалют, нажимая на кнопку "Изучить крипту".<br />
                      2. Накопив достаточно знаний, вы сможете применить их для получения USDT.<br />
                      3. Используйте USDT для приобретения оборудования, которое будет автоматически генерировать ресурсы.<br />
                      4. Постепенно открывайте новые механики и возможности по мере развития.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="resources" className="space-y-4 mt-4">
                    <h4 className="font-semibold">Основные ресурсы</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Знания о крипте</strong> - базовый ресурс для исследований и обмена на USDT.</li>
                      <li><strong>USDT</strong> - основная валюта для покупки оборудования и улучшений.</li>
                      <li><strong>Электричество</strong> - необходимо для работы компьютеров и майнинг-ферм.</li>
                      <li><strong>Вычислительная мощность</strong> - используется для майнинга и анализа данных.</li>
                      <li><strong>Репутация</strong> - влияет на эффективность социальных взаимодействий.</li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="buildings" className="space-y-4 mt-4">
                    <h4 className="font-semibold">Типы оборудования</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Практика</strong> - автоматически генерирует знания о криптовалютах.</li>
                      <li><strong>Генератор</strong> - производит электричество для ваших устройств.</li>
                      <li><strong>Домашний компьютер</strong> - обеспечивает вычислительную мощность.</li>
                      <li><strong>Криптокошелек</strong> - увеличивает максимальное хранение USDT.</li>
                      <li><strong>Интернет-канал</strong> - ускоряет получение знаний.</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Сбросить прогресс
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Сбросить прогресс?</DialogTitle>
                  <DialogDescription>
                    Это действие удалит все ваши достижения и начнет игру заново. Это действие нельзя отменить.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setResetConfirmOpen(false)}>
                    Отмена
                  </Button>
                  <Button variant="destructive" onClick={handleResetGame}>
                    Сбросить игру
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Настройки
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Настройки</DialogTitle>
                  <DialogDescription>
                    Управление игрой и дополнительные опции
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">О игре</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Версия: 0.1.0 (Альфа)<br />
                    © 2023 Crypto Civilization
                  </p>
                </div>
              </DialogContent>
            </Dialog>
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
              {hasUnlockedBuildings && (
                <Button 
                  variant={selectedTab === "equipment" ? "default" : "ghost"} 
                  className="justify-start rounded-none section-title h-6 px-3"
                  onClick={() => setSelectedTab("equipment")}
                >
                  <Building className="h-3 w-3 mr-2" />
                  Оборудование
                </Button>
              )}
              {hasUnlockedResearch && (
                <Button 
                  variant={selectedTab === "research" ? "default" : "ghost"} 
                  className="justify-start rounded-none section-title h-6 px-3"
                  onClick={() => setSelectedTab("research")}
                >
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Исследования
                </Button>
              )}
              <Button 
                variant={selectedTab === "referrals" ? "default" : "ghost"} 
                className="justify-start rounded-none section-title h-6 px-3"
                onClick={() => setSelectedTab("referrals")}
              >
                <Users className="h-3 w-3 mr-2" />
                Рефералы
              </Button>
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
              
              {selectedTab === "referrals" && (
                <ReferralsTab onAddEvent={addEvent} />
              )}
            </div>
            
            <div className="mt-auto sticky bottom-0 bg-white pb-2 pt-1">
              <ActionButtons onAddEvent={addEvent} />
            </div>
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
