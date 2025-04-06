import React, { useState, useEffect } from "react";
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface HeaderProps {
  prestigePoints: number;
}

const Header: React.FC<HeaderProps> = ({ prestigePoints }) => {
  const navigate = useNavigate();
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const { state } = useGame();
  const [debugData, setDebugData] = useState<{
    resources: {
      id: string;
      value: number;
      max: string | number;
      perSecond: number;
      production: number;
      consumption: number;
    }[];
    buildings: {
      id: string;
      count: number;
      production: any;
      consumption: any;
      cost: { [resourceId: string]: number };
      effects: string | { [effectId: string]: string | number };
    }[];
    lastUpdate: number;
    updateHistory: {
      timestamp: number;
      resourceChanges: { [id: string]: number };
    }[];
  }>({
    resources: [],
    buildings: [],
    lastUpdate: 0,
    updateHistory: []
  });

  useEffect(() => {
    if (debugDialogOpen) {
      updateDebugData();
    }
  }, [debugDialogOpen, state]);
  
  useEffect(() => {
    if (!debugDialogOpen) return;
    
    const intervalId = setInterval(() => {
      updateDebugData();
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [debugDialogOpen]);
  
  const updateDebugData = () => {
    const resources = Object.entries(state.resources)
      .filter(([_, r]) => r.unlocked)
      .map(([id, r]) => ({
        id,
        value: r.value || 0,
        max: r.max || "∞",
        perSecond: r.perSecond || 0,
        production: r.production || 0,
        consumption: r.consumption || 0
      }));
    
    const buildings = Object.entries(state.buildings)
      .filter(([_, b]) => b.unlocked && b.count > 0)
      .map(([id, b]) => ({
        id,
        count: b.count || 0,
        production: b.production || {},
        consumption: b.consumption || {},
        cost: b.cost || {},
        effects: b.effects || {}
      }));
    
    let updateHistory = debugData.updateHistory || [];
    const currentTime = Date.now();
    
    if (updateHistory.length === 0 || currentTime - updateHistory[0].timestamp > 1000) {
      const resourceChanges: { [id: string]: number } = {};
      resources.forEach(r => {
        const prevResource = debugData.resources.find(prevR => prevR.id === r.id);
        if (prevResource) {
          resourceChanges[r.id] = r.value - prevResource.value;
        } else {
          resourceChanges[r.id] = 0;
        }
      });
      
      updateHistory = [
        { timestamp: currentTime, resourceChanges },
        ...updateHistory
      ].slice(0, 10);
    }
    
    setDebugData({
      resources,
      buildings,
      lastUpdate: state.lastUpdate || 0,
      updateHistory
    });
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

  console.log('Рендеринг Header компонента');

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
          {prestigePoints > 0 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{prestigePoints}</span>
            </div>
          )}
          
          <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center" title="Отладка ресурсов">
                <Bug className="h-4 w-4 mr-1" />
                <span>Отладка</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Отладка накопления ресурсов</DialogTitle>
              </DialogHeader>
              
              <div className="py-2">
                <h3 className="font-medium mb-2">Текущая информация о ресурсах:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2">Ресурс</th>
                        <th className="text-right p-2">Значение</th>
                        <th className="text-right p-2">Макс.</th>
                        <th className="text-right p-2">Производство</th>
                        <th className="text-right p-2">Потребление</th>
                        <th className="text-right p-2">В секунду</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.resources.map(resourceItem => (
                        <tr key={resourceItem.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{state.resources[resourceItem.id]?.name || resourceItem.id}</td>
                          <td className="text-right p-2">{resourceItem.value.toFixed(2)}</td>
                          <td className="text-right p-2">{typeof resourceItem.max === 'number' ? resourceItem.max.toFixed(2) : resourceItem.max}</td>
                          <td className="text-right p-2">{resourceItem.production.toFixed(3)}</td>
                          <td className="text-right p-2">{resourceItem.consumption.toFixed(3)}</td>
                          <td className={`text-right p-2 ${resourceItem.perSecond > 0 ? 'text-green-600' : resourceItem.perSecond < 0 ? 'text-red-600' : ''}`}>
                            {resourceItem.perSecond.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="py-2">
                <h3 className="font-medium mb-2">Активные здания:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2">Здание</th>
                        <th className="text-right p-2">Количество</th>
                        <th className="text-left p-2">Производство</th>
                        <th className="text-left p-2">Потребление</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.buildings.map(building => (
                        <tr key={building.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{state.buildings[building.id]?.name || building.id}</td>
                          <td className="text-right p-2">{building.count}</td>
                          <td className="p-2 text-xs">
                            {Object.entries(building.production).map(([resourceId, amount]) => (
                              <div key={resourceId}>
                                {state.resources[resourceId]?.name || resourceId}: {Number(amount).toFixed(3)} × {building.count} = {(Number(amount) * building.count).toFixed(3)}/сек
                              </div>
                            ))}
                          </td>
                          <td className="p-2 text-xs">
                            {Object.entries(building.consumption).map(([resourceId, amount]) => (
                              <div key={resourceId}>
                                {state.resources[resourceId]?.name || resourceId}: {Number(amount).toFixed(3)} × {building.count} = {(Number(amount) * building.count).toFixed(3)}/сек
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="py-2">
                <h3 className="font-medium mb-2">История изменений ресурсов:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2">Время</th>
                        <th className="text-left p-2">Изменения ресурсов</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugData.updateHistory.map((update, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 whitespace-nowrap">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-2">
                            {Object.entries(update.resourceChanges).map(([resourceId, change]) => (
                              <div key={resourceId} className={`${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {state.resources[resourceId]?.name || resourceId}: {change > 0 ? '+' : ''}{change.toFixed(3)}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-4">
                Последнее обновление игры: {new Date(debugData.lastUpdate).toLocaleTimeString()}
              </div>
            </DialogContent>
          </Dialog>
          
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
