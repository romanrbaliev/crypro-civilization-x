import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ResourceList from "@/components/ResourceList";
import ActionButtons from "@/components/ActionButtons";
import EventLog from "@/components/EventLog";
import EquipmentTab from "@/components/EquipmentTab";
import ResearchTab from "@/components/ResearchTab";
import SpecializationTab from "@/components/SpecializationTab";
import ReferralsTab from "@/components/ReferralsTab";
import GameHeader from "@/components/GameHeader";
import { useGame } from "@/context/hooks/useGame";
import { useAutoSaveGame } from "@/hooks/useAutoSaveGame";
import { useResourceUpdater } from "@/hooks/useResourceUpdater";
import { usePhaseProgression } from "@/hooks/usePhaseProgression";
import { toast } from "sonner";
import { resetAllGameData } from "@/api/gameStorage";
import {
  Settings,
  Save,
  Menu,
  RefreshCcw,
  HelpCircle
} from "lucide-react";

const GameScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [events, setEvents] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useAutoSaveGame(state);
  useResourceUpdater();
  
  // Добавляем хук для отслеживания прогрессии фаз
  const { phase } = usePhaseProgression();

  useEffect(() => {
    if (!state.gameStarted) {
      dispatch({ type: "START_GAME" });
      addEventMessage("Игра началась!", "success");
    }
  }, [state.gameStarted, dispatch]);

  const addEventMessage = (message: string, type: string = "default") => {
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, message];
      if (newEvents.length > 5) {
        newEvents.shift();
      }
      return newEvents;
    });

    toast(message, {
      description: new Date().toLocaleTimeString(),
      type: type
    });
  };

  const handleResetGame = async () => {
    setIsResetting(true);
    try {
      await resetAllGameData();
      dispatch({ type: "RESET_GAME" });
      addEventMessage("Игра сброшена!", "warning");
    } catch (error) {
      console.error("Ошибка при сбросе игры:", error);
      addEventMessage("Ошибка при сбросе игры!", "error");
    } finally {
      setIsResetting(false);
    }
  };

  // Проверка разблокировки вкладки специализации (Фаза 3)
  const isSpecializationUnlocked = phase >= 3;

  return (
    <div className="game-container flex flex-col h-full max-w-md mx-auto">
      <GameHeader />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 left-2">
            <Menu className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Сброс прогресса</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите сбросить свой прогресс? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium leading-none text-right">
                Ваш ID:
              </label>
              <div className="col-span-3">
                {state.referralCode}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isResetting} onClick={handleResetGame}>
              Сбросить прогресс
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2">
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Настройки</SheetTitle>
            <SheetDescription>
              Здесь вы можете настроить параметры игры и посмотреть полезную информацию.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <Button variant="outline" className="w-full justify-start mb-2">
              <Save className="mr-2 h-4 w-4" />
              Сохранить игру
            </Button>
            <Button variant="outline" className="w-full justify-start mb-2">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Сбросить игру
            </Button>
            <Button variant="outline" className="w-full justify-start mb-2">
              <HelpCircle className="mr-2 h-4 w-4" />
              Помощь
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex-grow overflow-y-auto pb-24">
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="resources">Ресурсы</TabsTrigger>
            <TabsTrigger value="equipment">Оборудование</TabsTrigger>
            <TabsTrigger value="research">Исследования</TabsTrigger>
            <TabsTrigger value="referrals">Рефералы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="h-full">
            <ResourceList />
            <ActionButtons onAddEvent={addEventMessage} />
            <EventLog events={events} />
          </TabsContent>
          
          <TabsContent value="equipment">
            <EquipmentTab onAddEvent={addEventMessage} />
          </TabsContent>
          
          <TabsContent value="research">
            <ResearchTab onAddEvent={addEventMessage} />
          </TabsContent>
          
          <TabsContent value="referrals">
            <ReferralsTab onAddEvent={addEventMessage} />
          </TabsContent>
          
          {isSpecializationUnlocked && (
            <>
              <Separator className="my-2" />
              <TabsList className="grid grid-cols-1 mb-2">
                <TabsTrigger value="specialization">Специализация</TabsTrigger>
              </TabsList>
              <TabsContent value="specialization">
                <SpecializationTab onAddEvent={addEventMessage} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Button className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2">
        Престиж
      </Button>
    </div>
  );
};

export default GameScreen;
