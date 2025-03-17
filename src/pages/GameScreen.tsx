
import React, { useEffect } from "react";
import { useGame } from "@/context/hooks/useGame";
import Header from "@/components/Header";
import ResourceList from "@/components/ResourceList";
import ActionButtons from "@/components/ActionButtons";
import BuildingItem from "@/components/BuildingItem";
import UpgradeItem from "@/components/UpgradeItem";
import EventLog from "@/components/EventLog";
import MiningInfo from "@/components/MiningInfo";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, BuildingIcon, Microscope } from "lucide-react";

const GameScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  
  // Фильтрация ресурсов для отображения только разблокированных
  const unlockedResources = Object.values(state.resources).filter(
    (resource) => resource.unlocked
  );
  
  // Фильтрация зданий для отображения только разблокированных
  const unlockedBuildings = Object.values(state.buildings).filter(
    (building) => building.unlocked
  );
  
  // Фильтрация улучшений для отображения только разблокированных
  const unlockedUpgrades = Object.values(state.upgrades).filter(
    (upgrade) => upgrade.unlocked && !upgrade.purchased
  );
  
  // Фильтрация улучшений для отображения только купленных
  const purchasedUpgrades = Object.values(state.upgrades).filter(
    (upgrade) => upgrade.purchased
  );
  
  // Перезапускаем компьютеры, если электричество восстановлено
  const handleRestartComputers = () => {
    dispatch({ type: "RESTART_COMPUTERS" });
  };

  // Получаем список игровых событий из состояния
  const gameEvents = state.events || [];

  // Периодическое обновление ресурсов
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: "UPDATE_RESOURCES" });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header prestigePoints={state.prestigePoints} />
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mb-4">
            <ResourceList resources={unlockedResources} />
          </div>
          
          {/* Компонент информации о майнинге, если автомайнер приобретен */}
          <MiningInfo />
          
          <ActionButtons />
          
          {/* Кнопка перезапуска компьютеров, если есть нехватка электричества */}
          {state.eventMessages.electricityShortage && (
            <Button 
              onClick={handleRestartComputers}
              variant="destructive"
              className="w-full mt-2 text-sm"
            >
              Перезапустить компьютеры
            </Button>
          )}
          
          <div className="mt-6">
            <Tabs defaultValue="buildings">
              <TabsList className="w-full">
                <TabsTrigger value="buildings" className="flex-1">
                  <BuildingIcon className="mr-2 h-4 w-4" />
                  Здания
                </TabsTrigger>
                <TabsTrigger value="research" className="flex-1">
                  <Microscope className="mr-2 h-4 w-4" />
                  Исследования
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="buildings" className="mt-2 space-y-2">
                {unlockedBuildings.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Нет доступных зданий
                  </div>
                ) : (
                  unlockedBuildings.map((building) => (
                    <BuildingItem
                      key={building.id}
                      building={building}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="research" className="mt-2">
                {unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Нет доступных исследований
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unlockedUpgrades.map((upgrade) => (
                      <UpgradeItem
                        key={upgrade.id}
                        upgrade={upgrade}
                      />
                    ))}
                    
                    {purchasedUpgrades.length > 0 && (
                      <>
                        <h3 className="text-sm font-medium mt-4 mb-2">Завершенные исследования</h3>
                        {purchasedUpgrades.map((upgrade) => (
                          <UpgradeItem
                            key={upgrade.id}
                            upgrade={upgrade}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronRight />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Журнал событий</SheetTitle>
            <SheetDescription>
              История всех игровых событий
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="p-4">
              <EventLog events={gameEvents} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GameScreen;
