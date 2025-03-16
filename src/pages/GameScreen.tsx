
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
import { 
  BitcoinIcon, 
  ArrowLeft, 
  ChevronRight, 
  LayoutGrid, 
  Lightbulb, 
  Trophy, 
  Settings,
  BookOpen,
  Building,
  Cpu
} from "lucide-react";
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
  const [selectedTab, setSelectedTab] = useState("buildings");
  
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Верхняя панель */}
      <header className="bg-white border-b shadow-sm p-2 flex-shrink-0">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="ml-2 flex items-center space-x-2">
              <BitcoinIcon className="h-5 w-5 text-amber-500" />
              <h1 className="text-lg font-bold">Crypto Civilization</h1>
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
      
      {/* Основной контент - двухколоночная сетка */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая колонка (40%) - Разделы и Ресурсы */}
        <div className="w-2/5 border-r flex flex-col overflow-hidden">
          {/* Верхняя часть - Разделы/Категории */}
          <div className="border-b">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="buildings" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Здания
                </TabsTrigger>
                <TabsTrigger value="research" className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Исследования
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Нижняя часть - Ресурсы */}
          <div className="flex-1 overflow-auto p-2">
            <div className="space-y-3">
              {unlockedResources.map(resource => (
                <div key={resource.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{resource.icon}</span>
                      <span className="font-medium">{resource.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {resource.value.toFixed(0)}
                        {resource.max !== Infinity && `/${resource.max.toFixed(0)}`}
                      </div>
                      {resource.perSecond > 0 && (
                        <div className="text-xs text-green-600">+{resource.perSecond.toFixed(2)}/сек</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Правая колонка (60%) - Содержимое выбранного раздела */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-2">
            {selectedTab === "buildings" && (
              <div className="space-y-3">
                {/* Кнопки действий вверху */}
                <div className="bg-white rounded-lg p-3 space-y-3">
                  <h2 className="font-semibold text-lg mb-2">Действия</h2>
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
                
                {/* Список доступных зданий */}
                {unlockedBuildings.length > 0 ? (
                  <div className="space-y-2">
                    <h2 className="font-semibold text-lg">Доступные здания</h2>
                    {unlockedBuildings.map(building => (
                      <BuildingItem 
                        key={building.id} 
                        building={building} 
                        onPurchase={() => addEvent(`Построено здание: ${building.name}`, "success")} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
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
              </div>
            )}
            
            {selectedTab === "research" && (
              <div className="space-y-3">
                <h2 className="font-semibold text-lg">Исследования</h2>
                
                {unlockedUpgrades.length > 0 ? (
                  <div>
                    <h3 className="font-medium mb-2">Доступные исследования</h3>
                    <div className="space-y-2">
                      {unlockedUpgrades.map(upgrade => (
                        <UpgradeItem 
                          key={upgrade.id} 
                          upgrade={upgrade} 
                          onPurchase={() => addEvent(`Завершено исследование: ${upgrade.name}`, "success")} 
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
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
                
                {purchasedUpgrades.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Завершенные исследования</h3>
                    <div className="space-y-2">
                      {purchasedUpgrades.map(upgrade => (
                        <UpgradeItem key={upgrade.id} upgrade={upgrade} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Нижний журнал событий на всю ширину экрана */}
      <div className="h-40 border-t bg-white flex-shrink-0">
        <EventLog events={eventLog} />
      </div>
    </div>
  );
};

export default GameScreen;
