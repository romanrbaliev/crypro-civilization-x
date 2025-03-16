
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ResourceDisplay from "@/components/ResourceDisplay";
import BuildingItem from "@/components/BuildingItem";
import UpgradeItem from "@/components/UpgradeItem";
import ResourceForecast from "@/components/ResourceForecast";
import EventLog, { GameEvent } from "@/components/EventLog";
import { calculateTimeToReach, generateId } from "@/utils/helpers";
import { BitcoinIcon, ArrowLeft, ChevronUp, LayoutGrid, Lightbulb, Trophy, Settings } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const GameScreen = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(!state.gameStarted);
  const [eventLog, setEventLog] = useState<GameEvent[]>([]);
  const [clickCount, setClickCount] = useState(0);
  
  // Если игра еще не начата, перенаправляем на стартовую страницу
  useEffect(() => {
    if (!state.gameStarted) {
      navigate("/");
    }
  }, [state.gameStarted, navigate]);
  
  // Добавление события в журнал
  const addEvent = (message: string, type: GameEvent["type"] = "info") => {
    const newEvent: GameEvent = {
      id: generateId(),
      timestamp: Date.now(),
      message,
      type
    };
    
    setEventLog(prev => [...prev, newEvent]);
  };
  
  // Обработчики событий
  const handleStudyCrypto = () => {
    // Отправляем действие для увеличения знаний
    dispatch({ 
      type: "INCREMENT_RESOURCE", 
      payload: { 
        resourceId: "knowledge", 
        amount: 1 
      } 
    });
    
    // Для верификации, выведем уведомление
    console.log("Изучение крипты: +1 знание");
    
    // Отслеживаем количество кликов для обучения
    setClickCount(prev => {
      const newCount = prev + 1;
      
      // Подсказки для нового игрока
      if (newCount === 3) {
        addEvent("Вы начинаете понимать основы криптовалют!", "info");
      } else if (newCount === 10) {
        addEvent("Продолжайте изучать, чтобы применить знания на практике", "info");
      }
      
      return newCount;
    });
  };
  
  const handleApplyKnowledge = () => {
    const resource = state.resources.knowledge;
    if (resource.value >= 10) {
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: -10 } });
      dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "usdt", amount: 1 } });
      
      // Добавляем событие
      addEvent("Вы конвертировали знания в USDT", "success");
    } else {
      toast.error("Недостаточно знаний! Нужно минимум 10.");
      addEvent("Не удалось применить знания - нужно больше изучать", "error");
    }
  };
  
  // Получаем списки ресурсов, зданий и апгрейдов
  const unlockedResources = Object.values(state.resources).filter(r => r.unlocked);
  const unlockedBuildings = Object.values(state.buildings).filter(b => b.unlocked);
  const unlockedUpgrades = Object.values(state.upgrades).filter(u => u.unlocked && !u.purchased);
  const purchasedUpgrades = Object.values(state.upgrades).filter(u => u.purchased);
  
  // Обработчик закрытия интро
  const handleCloseIntro = () => {
    setShowIntro(false);
    dispatch({ type: "START_GAME" });
    
    // Добавляем первое событие в журнал
    addEvent("Добро пожаловать в мир криптовалют! Начните с изучения основ.", "info");
  };
  
  // Цели для отображения прогнозов
  const getResourceTargets = () => {
    return {
      knowledge: state.unlocks.applyKnowledge ? 10 : 5,
      usdt: state.buildings.generator.unlocked ? 25 : 10
    };
  };
  
  const resourceTargets = getResourceTargets();
  
  // Для отладки: выводим текущее значение ресурса знаний
  useEffect(() => {
    console.log("Текущее значение знаний:", state.resources.knowledge.value);
  }, [state.resources.knowledge.value]);
  
  // Интро для новых игроков
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto text-center">
          <BitcoinIcon className="h-16 w-16 text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Добро пожаловать в Crypto Civilization!</h1>
          <p className="text-lg mb-8">
            Вы начинаете свой путь в мире криптовалют как энтузиаст, делающий первые шаги.
            Постепенно вы будете развивать свои знания, инфраструктуру и влияние, чтобы создать целую криптоцивилизацию!
          </p>
          
          <div className="space-y-4 text-left mb-8 bg-gray-50 p-4 rounded-lg w-full">
            <h2 className="font-semibold text-lg">Ваши первые шаги:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Нажимайте на кнопку "Изучить крипту", чтобы получать знания о криптовалютах</li>
              <li>Когда накопите 10 единиц знаний, вы сможете применить их и получить USDT</li>
              <li>Используйте USDT для строительства зданий, автоматизирующих получение ресурсов</li>
              <li>Постепенно открывайте новые механики, здания и исследования</li>
            </ol>
          </div>
          
          <Button size="lg" onClick={handleCloseIntro}>
            Начать свой путь
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Верхняя панель */}
      <header className="bg-white border-b shadow-sm p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="ml-4 flex items-center space-x-2">
              <BitcoinIcon className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-bold">Crypto Civilization</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {state.prestigePoints > 0 && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{state.prestigePoints}</span>
              </div>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Настройки</SheetTitle>
                  <SheetDescription>
                    Управление игрой и дополнительные опции
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">Геймплей</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/")}
                    >
                      Вернуться в главное меню
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium mb-2">О игре</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Версия: 0.1.0 (Альфа)<br />
                    © 2023 Crypto Civilization
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Панель ресурсов */}
      <div className="bg-white border-b shadow-sm py-2 px-4 sticky top-16 z-10">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            {unlockedResources.map(resource => (
              <ResourceDisplay key={resource.id} resource={resource} compact />
            ))}
          </div>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <main className="flex-1 container mx-auto p-4 md:flex gap-6">
        {/* Левая панель (действия и статистика) */}
        <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="font-bold text-lg mb-4">Действия</h2>
            
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleStudyCrypto}
              >
                🧠 Изучить крипту
              </Button>
              
              {state.unlocks.applyKnowledge && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleApplyKnowledge}
                    disabled={state.resources.knowledge.value < 10}
                  >
                    💰 Применить знания (10 🧠 → 1 💰)
                  </Button>
                  
                  {state.resources.knowledge.perSecond > 0 && (
                    <ResourceForecast 
                      resource={state.resources.knowledge} 
                      targetValue={10} 
                      label="До конвертации" 
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-lg mb-4">Статистика</h2>
            
            <div className="space-y-4">
              {unlockedResources.map(resource => (
                <ResourceDisplay key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
          
          <EventLog events={eventLog} />
        </div>
        
        {/* Правая панель (здания, исследования и т.д.) */}
        <div className="md:w-2/3 lg:w-3/4">
          <Tabs defaultValue="buildings">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="buildings" className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Здания
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Исследования
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buildings" className="mt-4">
              {unlockedBuildings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedBuildings.map(building => (
                    <BuildingItem key={building.id} building={building} onPurchase={() => addEvent(`Построено здание: ${building.name}`, "success")} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>У вас пока нет доступных зданий.<br />Продолжайте набирать знания и ресурсы.</p>
                  
                  {state.resources.knowledge.value < 15 && state.resources.knowledge.perSecond > 0 && (
                    <div className="mt-4">
                      <ResourceForecast 
                        resource={state.resources.knowledge} 
                        targetValue={15} 
                        label="До открытия здания «Практика»" 
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="research" className="mt-4">
              <div className="space-y-6">
                {unlockedUpgrades.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Доступные исследования</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unlockedUpgrades.map(upgrade => (
                        <UpgradeItem key={upgrade.id} upgrade={upgrade} onPurchase={() => addEvent(`Завершено исследование: ${upgrade.name}`, "success")} />
                      ))}
                    </div>
                  </div>
                )}
                
                {purchasedUpgrades.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Завершенные исследования</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchasedUpgrades.map(upgrade => (
                        <UpgradeItem key={upgrade.id} upgrade={upgrade} />
                      ))}
                    </div>
                  </div>
                )}
                
                {unlockedUpgrades.length === 0 && purchasedUpgrades.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>У вас пока нет доступных исследований.<br />Продолжайте набирать знания и ресурсы.</p>
                    
                    {state.resources.knowledge.value < 45 && state.resources.knowledge.perSecond > 0 && (
                      <div className="mt-4">
                        <ResourceForecast 
                          resource={state.resources.knowledge} 
                          targetValue={45} 
                          label="До открытия исследования «Основы блокчейна»" 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default GameScreen;
