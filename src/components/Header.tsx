
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BitcoinIcon, ArrowLeft, Trophy, Settings, RefreshCcw, Bug } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resetAllGameData } from "@/context/utils/gameStorage";
import { toast } from "@/hooks/use-toast";
import { useGame } from "@/context/hooks/useGame";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface HeaderProps {
  prestigePoints: number;
}

const Header: React.FC<HeaderProps> = ({ prestigePoints }) => {
  const navigate = useNavigate();
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const { state } = useGame();

  const handleResetAll = async () => {
    try {
      await resetAllGameData();
      toast({
        title: "Сброс выполнен",
        description: "Все сохранения успешно удалены. Страница будет перезагружена.",
        variant: "success",
      });
      
      // Перезагрузка страницы после небольшой задержки
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

  const triggerResourceDebug = () => {
    console.log("=== ОТЛАДКА СИСТЕМЫ РЕСУРСОВ ===");
    
    // Вывод информации о времени обновления
    const currentTime = Date.now();
    const lastUpdateDiff = currentTime - state.lastUpdate;
    console.log(`[Debug] Текущее время: ${new Date(currentTime).toISOString()}`);
    console.log(`[Debug] Последнее обновление: ${new Date(state.lastUpdate).toISOString()}`);
    console.log(`[Debug] Прошло с последнего обновления: ${lastUpdateDiff}мс`);
    
    // Вывод информации о состоянии ресурсов
    console.log("[Debug] Состояние всех ресурсов:");
    Object.entries(state.resources).forEach(([id, resource]) => {
      const res = resource as any;
      if (res.unlocked) {
        console.log(`[Debug] ${id}: значение=${res.value?.toFixed(2) || 0}, макс=${res.max || '∞'}, скорость=${res.perSecond?.toFixed(4) || 0}/сек`);
        console.log(`[Debug] ${id}: производство=${res.production?.toFixed(4) || 0}, потребление=${res.consumption?.toFixed(4) || 0}`);
      }
    });
    
    // Вывод информации о зданиях
    console.log("[Debug] Здания, влияющие на производство:");
    Object.entries(state.buildings).forEach(([id, building]) => {
      if (building.count > 0) {
        console.log(`[Debug] ${id}: количество=${building.count}, производство:`, building.production || 'нет', 'потребление:', building.consumption || 'нет');
      }
    });
    
    // Путь выполнения кода
    console.log("[Debug] Проверка последовательности обновления:");
    console.log("[Debug] 1. useGameStateUpdateService -> updateGameState (каждый кадр)");
    console.log("[Debug] 2. updateResources(deltaTime) -> resourceSystem.updateResources(state, deltaTime)");
    console.log("[Debug] 3. dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState })");
    console.log("[Debug] 4. gameReducer -> case 'FORCE_RESOURCE_UPDATE'");
    
    // Отображение в интерфейсе
    toast({
      title: "Отладка ресурсов",
      description: "Информация выведена в консоль разработчика (F12)",
      variant: "default",
    });
  };

  const triggerProductionConsumptionDebug = () => {
    console.log("=== ОТЛАДКА ПРОИЗВОДСТВА/ПОТРЕБЛЕНИЯ ===");
    
    // Импорт ResourceSystem для проверки
    const ResourceSystem = require('@/systems/ResourceSystem').ResourceSystem;
    const resourceSystem = new ResourceSystem();
    
    // Создаем копию состояния
    const stateCopy = JSON.parse(JSON.stringify(state));
    
    // Проверяем пересчет производства/потребления
    console.log("[Debug] Пересчитываем производство/потребление...");
    const updatedState = resourceSystem.updateProductionConsumption(stateCopy);
    
    // Проверяем обновление максимумов
    console.log("[Debug] Пересчитываем максимальные значения...");
    const updatedWithMaxes = resourceSystem.updateResourceMaxValues(updatedState);
    
    // Выводим результаты
    console.log("[Debug] Результаты пересчета:");
    Object.entries(updatedWithMaxes.resources).forEach(([id, resource]) => {
      const res = resource as any;
      if (res.unlocked) {
        console.log(`[Debug] ${id}: perSecond=${res.perSecond?.toFixed(4) || 0}/сек (производство=${res.production?.toFixed(4) || 0}, потребление=${res.consumption?.toFixed(4) || 0})`);
      }
    });
    
    toast({
      title: "Отладка производства",
      description: "Информация о производстве выведена в консоль",
      variant: "default",
    });
  };

  const triggerPurchaseSystemDebug = () => {
    console.log("=== ОТЛАДКА СИСТЕМЫ ПОКУПОК ===");
    
    // Вывод информации о зданиях и их эффектах
    console.log("[Debug] Здания и их эффекты:");
    Object.entries(state.buildings).forEach(([id, building]) => {
      if (building.unlocked) {
        console.log(`[Debug] ${id}: количество=${building.count}, стоимость:`, building.cost);
        if (building.effects) {
          console.log(`[Debug] ${id} эффекты:`, building.effects);
        }
      }
    });
    
    // Проверка системы покупок
    console.log("[Debug] Путь выполнения покупки:");
    console.log("[Debug] 1. Нажатие на кнопку -> dispatch({ type: 'BUY_BUILDING', payload: { buildingId } })");
    console.log("[Debug] 2. gameReducer -> case 'BUY_BUILDING' -> processPurchase(newState, { itemId, itemType })");
    console.log("[Debug] 3. processPurchase -> проверка ресурсов -> списание ресурсов -> обновление здания");
    console.log("[Debug] 4. resourceSystem.updateProductionConsumption -> пересчет производства/потребления");
    console.log("[Debug] 5. resourceSystem.updateResourceMaxValues -> пересчет максимумов");
    
    toast({
      title: "Отладка покупок",
      description: "Информация о покупках выведена в консоль",
      variant: "default",
    });
  };

  return (
    <header className="bg-white border-b shadow-sm p-2 flex-shrink-0">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="ml-2 flex items-center space-x-2">
            <BitcoinIcon className="h-5 w-5 text-amber-500" />
            <h1 className="text-base font-bold">Crypto Civilization</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Отладочное меню */}
          <Menubar className="border-none shadow-none">
            <MenubarMenu>
              <MenubarTrigger className="font-medium p-1">
                <Bug className="h-4 w-4 text-red-500 mr-1" />
                Отладка
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={triggerResourceDebug}>
                  Проверка ресурсов
                </MenubarItem>
                <MenubarItem onClick={triggerProductionConsumptionDebug}>
                  Проверка производства
                </MenubarItem>
                <MenubarItem onClick={triggerPurchaseSystemDebug}>
                  Проверка системы покупок
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => console.clear()}>
                  Очистить консоль
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          
          {prestigePoints > 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{prestigePoints}</span>
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
                <h3 className="font-medium mb-2">Настройки игры</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/")}
                  >
                    Вернуться в главное меню
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                    onClick={() => setResetAlertOpen(true)}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Сбросить прогресс
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
      
      {/* Диалог подтверждения сброса */}
      <AlertDialog open={resetAlertOpen} onOpenChange={setResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сбросить все сохранения?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит все сохранения игры для всех пользователей.
              Данное действие невозможно отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-red-500 hover:bg-red-600">
              Сбросить все сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
