
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HeaderProps {
  prestigePoints: number;
}

const Header: React.FC<HeaderProps> = ({ prestigePoints }) => {
  const navigate = useNavigate();
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const { state } = useGame();
  const [debugInfo, setDebugInfo] = useState({
    resources: [] as Array<{id: string, value: number, max: string|number, perSecond: number}>,
    buildings: [] as Array<{id: string, count: number, production: any, consumption: any}>,
    lastUpdate: 0,
    productionFlow: [] as string[]
  });

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
    
    // Подготовка данных для отображения в интерфейсе
    const resourcesInfo = Object.entries(state.resources)
      .filter(([_, r]) => {
        const resource = r as any;
        return resource.unlocked;
      })
      .map(([id, r]) => {
        const resource = r as any;
        return {
          id,
          value: Number(resource.value?.toFixed(2)) || 0,
          max: resource.max || '∞',
          perSecond: Number(resource.perSecond?.toFixed(4)) || 0,
          production: Number(resource.production?.toFixed(4)) || 0,
          consumption: Number(resource.consumption?.toFixed(4)) || 0
        };
      });
    
    const buildingsInfo = Object.entries(state.buildings)
      .filter(([_, building]) => building.count > 0)
      .map(([id, building]) => ({
        id,
        count: building.count,
        production: building.production || 'нет',
        consumption: building.consumption || 'нет'
      }));
    
    const productionFlow = [
      "1. useGameStateUpdateService -> updateGameState (каждый кадр)",
      "2. updateResources(deltaTime) -> resourceSystem.updateResources(state, deltaTime)",
      "3. dispatch({ type: 'FORCE_RESOURCE_UPDATE', payload: updatedState })",
      "4. gameReducer -> case 'FORCE_RESOURCE_UPDATE'"
    ];
    
    setDebugInfo({
      resources: resourcesInfo,
      buildings: buildingsInfo,
      lastUpdate: lastUpdateDiff,
      productionFlow
    });
    
    setDebugDialogOpen(true);
  };

  const triggerProductionConsumptionDebug = () => {
    // Импорт ResourceSystem для проверки
    const ResourceSystem = require('@/systems/ResourceSystem').ResourceSystem;
    const resourceSystem = new ResourceSystem();
    
    // Создаем копию состояния
    const stateCopy = JSON.parse(JSON.stringify(state));
    
    // Проверяем пересчет производства/потребления
    const updatedState = resourceSystem.updateProductionConsumption(stateCopy);
    
    // Проверяем обновление максимумов
    const updatedWithMaxes = resourceSystem.updateResourceMaxValues(updatedState);
    
    // Подготовка данных для отображения
    const resourcesInfo = Object.entries(updatedWithMaxes.resources)
      .filter(([_, r]) => {
        const resource = r as any;
        return resource.unlocked;
      })
      .map(([id, r]) => {
        const resource = r as any;
        return {
          id,
          value: Number(resource.value?.toFixed(2)) || 0,
          max: resource.max || '∞',
          perSecond: Number(resource.perSecond?.toFixed(4)) || 0,
          production: Number(resource.production?.toFixed(4)) || 0,
          consumption: Number(resource.consumption?.toFixed(4)) || 0
        };
      });
    
    setDebugInfo({
      ...debugInfo,
      resources: resourcesInfo,
      productionFlow: ["Перерасчет производства/потребления", "Обновление максимальных значений"]
    });
    
    setDebugDialogOpen(true);
  };

  const triggerPurchaseSystemDebug = () => {
    // Подготовка данных зданий для отображения
    const buildingsInfo = Object.entries(state.buildings)
      .filter(([_, building]) => building.unlocked)
      .map(([id, building]) => ({
        id,
        count: building.count,
        cost: building.cost,
        effects: building.effects || 'нет эффектов'
      }));
    
    const productionFlow = [
      "1. Нажатие на кнопку -> dispatch({ type: 'BUY_BUILDING', payload: { buildingId } })",
      "2. gameReducer -> case 'BUY_BUILDING' -> processPurchase(newState, { itemId, itemType })",
      "3. processPurchase -> проверка ресурсов -> списание ресурсов -> обновление здания",
      "4. resourceSystem.updateProductionConsumption -> пересчет производства/потребления",
      "5. resourceSystem.updateResourceMaxValues -> пересчет максимумов"
    ];
    
    setDebugInfo({
      ...debugInfo,
      buildings: buildingsInfo,
      productionFlow
    });
    
    setDebugDialogOpen(true);
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
          <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="font-medium">
                <Bug className="h-4 w-4 text-red-500 mr-1" />
                Отладка
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Отладка игровых систем</DialogTitle>
                <DialogDescription>
                  Подробная информация о состоянии игровых систем и ресурсов
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" onClick={triggerResourceDebug}>Проверка ресурсов</Button>
                  <Button variant="outline" onClick={triggerProductionConsumptionDebug}>Проверка производства</Button>
                  <Button variant="outline" onClick={triggerPurchaseSystemDebug}>Проверка системы покупок</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ресурсы:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">ID</th>
                          <th className="border p-2 text-left">Значение</th>
                          <th className="border p-2 text-left">Максимум</th>
                          <th className="border p-2 text-left">В секунду</th>
                          <th className="border p-2 text-left">Производство</th>
                          <th className="border p-2 text-left">Потребление</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugInfo.resources.map(res => (
                          <tr key={res.id}>
                            <td className="border p-2">{res.id}</td>
                            <td className="border p-2">{res.value}</td>
                            <td className="border p-2">{res.max}</td>
                            <td className="border p-2" style={{color: res.perSecond >= 0 ? 'green' : 'red'}}>
                              {res.perSecond}
                            </td>
                            <td className="border p-2 text-green-600">{res.production}</td>
                            <td className="border p-2 text-red-600">{res.consumption}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Здания:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">ID</th>
                          <th className="border p-2 text-left">Количество</th>
                          <th className="border p-2 text-left">Производство</th>
                          <th className="border p-2 text-left">Потребление</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugInfo.buildings.map(building => (
                          <tr key={building.id}>
                            <td className="border p-2">{building.id}</td>
                            <td className="border p-2">{building.count}</td>
                            <td className="border p-2">{JSON.stringify(building.production)}</td>
                            <td className="border p-2">{JSON.stringify(building.consumption)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Процесс обновления:</h3>
                  <div className="bg-gray-100 p-3 rounded">
                    <ol className="list-decimal list-inside">
                      {debugInfo.productionFlow.map((step, index) => (
                        <li key={index} className="mb-1">{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="mt-2">
                    <p>Время с последнего обновления: {debugInfo.lastUpdate}мс</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
