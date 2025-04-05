
import React, { useState, useMemo } from "react";
import { useGame } from "@/context/hooks/useGame";
import { Info, Lock, Unlock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UnlockService } from "@/services/UnlockService";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UnlockableItem, UnlockCondition } from "@/systems/unlock/types";
import { unlockableItemsRegistry } from "@/systems/unlock/registry";

const UnlockStatusPopup = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [openSheet, setOpenSheet] = useState(false);
  
  // Получаем полный отчет о разблокировках
  const unlockService = new UnlockService();
  const unlockReport = useMemo(() => {
    return unlockService.getDebugReport(state);
  }, [state]);
  
  // Группируем элементы по типу
  const groupedItems = useMemo(() => {
    const groups = {
      resource: [] as UnlockableItem[],
      building: [] as UnlockableItem[],
      upgrade: [] as UnlockableItem[],
      feature: [] as UnlockableItem[],
      action: [] as UnlockableItem[],
    };
    
    Object.values(unlockableItemsRegistry).forEach(item => {
      if (groups[item.type as keyof typeof groups]) {
        groups[item.type as keyof typeof groups].push(item);
      }
    });
    
    return groups;
  }, []);
  
  // Форматируем отображение операторов условия
  const formatOperator = (operator: string): string => {
    switch (operator) {
      case "eq": return "=";
      case "neq": return "≠";
      case "gte": return "≥";
      case "lte": return "≤";
      case "gt": return ">";
      case "lt": return "<";
      default: return operator;
    }
  };
  
  // Проверяем, выполнено ли условие разблокировки
  const checkConditionMet = (condition: UnlockCondition): boolean => {
    if (condition.type === 'counter') {
      const counter = state.counters[condition.targetId];
      const counterValue = typeof counter === 'object' ? counter?.value : counter;
      
      if (typeof counterValue === 'number') {
        switch (condition.operator) {
          case 'eq': return counterValue === Number(condition.targetValue);
          case 'neq': return counterValue !== Number(condition.targetValue);
          case 'gte': return counterValue >= Number(condition.targetValue);
          case 'lte': return counterValue <= Number(condition.targetValue);
          case 'gt': return counterValue > Number(condition.targetValue);
          case 'lt': return counterValue < Number(condition.targetValue);
          default: return false;
        }
      }
    }
    
    if (condition.type === 'resource') {
      const resource = state.resources[condition.targetId];
      const resourceValue = resource?.value || 0;
      
      if (typeof resourceValue === 'number') {
        switch (condition.operator) {
          case 'eq': return resourceValue === Number(condition.targetValue);
          case 'neq': return resourceValue !== Number(condition.targetValue);
          case 'gte': return resourceValue >= Number(condition.targetValue);
          case 'lte': return resourceValue <= Number(condition.targetValue);
          case 'gt': return resourceValue > Number(condition.targetValue);
          case 'lt': return resourceValue < Number(condition.targetValue);
          default: return false;
        }
      }
    }
    
    if (condition.type === 'building') {
      const building = state.buildings[condition.targetId];
      const buildingCount = building?.count || 0;
      
      if (typeof buildingCount === 'number') {
        switch (condition.operator) {
          case 'eq': return buildingCount === Number(condition.targetValue);
          case 'neq': return buildingCount !== Number(condition.targetValue);
          case 'gte': return buildingCount >= Number(condition.targetValue);
          case 'lte': return buildingCount <= Number(condition.targetValue);
          case 'gt': return buildingCount > Number(condition.targetValue);
          case 'lt': return buildingCount < Number(condition.targetValue);
          default: return false;
        }
      }
    }
    
    if (condition.type === 'upgrade') {
      const upgrade = state.upgrades[condition.targetId];
      const isUpgradePurchased = upgrade?.purchased || false;
      
      return isUpgradePurchased === condition.targetValue;
    }
    
    return false;
  };
  
  // Проверяем, разблокирован ли элемент
  const isItemUnlocked = (itemId: string): boolean => {
    if (state.unlocks[itemId] === true) return true;
    
    if (itemId in state.resources && state.resources[itemId]?.unlocked) return true;
    if (itemId in state.buildings && state.buildings[itemId]?.unlocked) return true;
    if (itemId in state.upgrades && state.upgrades[itemId]?.unlocked) return true;
    
    return false;
  };
  
  // Получаем текущее значение целевого условия
  const getTargetCurrentValue = (condition: UnlockCondition): string | number | boolean => {
    if (condition.type === 'counter') {
      const counter = state.counters[condition.targetId];
      return typeof counter === 'object' ? counter?.value || 0 : counter || 0;
    }
    
    if (condition.type === 'resource') {
      return state.resources[condition.targetId]?.value || 0;
    }
    
    if (condition.type === 'building') {
      return state.buildings[condition.targetId]?.count || 0;
    }
    
    if (condition.type === 'upgrade') {
      return state.upgrades[condition.targetId]?.purchased || false;
    }
    
    return 0;
  };
  
  // Принудительно разблокируем элемент
  const handleForceUnlock = (itemId: string) => {
    dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    
    setTimeout(() => {
      const unlockService = new UnlockService();
      unlockService.forceUnlock(state, itemId);
      
      dispatch({ type: "FORCE_RESOURCE_UPDATE" });
      
      toast({
        title: "Разблокировка элемента",
        description: `Элемент ${itemId} принудительно разблокирован`,
        variant: "default",
      });
    }, 100);
  };
  
  // Принудительно проверяем все разблокировки
  const handleCheckAllUnlocks = () => {
    dispatch({ type: "FORCE_CHECK_UNLOCKS" });
    
    toast({
      title: "Проверка разблокировок",
      description: "Проверка всех разблокировок завершена",
      variant: "default",
    });
  };
  
  // Рендер списка всех разблокируемых элементов
  const renderUnlockableItemsList = () => {
    // Объединяем все типы элементов в один массив
    const allItems = [
      ...groupedItems.resource,
      ...groupedItems.building,
      ...groupedItems.upgrade,
      ...groupedItems.feature,
      ...groupedItems.action
    ];
    
    // Добавляем обмен BTC если его нет в списке
    const hasBtcExchange = allItems.some(item => item.id === 'exchangeBtc');
    if (!hasBtcExchange) {
      allItems.push({
        id: 'exchangeBtc',
        type: 'feature',
        name: 'Обмен BTC',
        conditions: [
          {
            id: 'has_bitcoin_for_exchange',
            type: 'resource',
            targetId: 'bitcoin',
            targetValue: 0,
            operator: 'gte',
            description: 'Иметь некоторое количество Bitcoin'
          }
        ],
        autoUnlock: true,
        influencesOthers: false
      });
    }
    
    // Добавляем computingPower если его нет в списке
    const hasComputingPower = allItems.some(item => item.id === 'computingPower');
    if (!hasComputingPower) {
      allItems.push({
        id: 'computingPower',
        type: 'resource',
        name: 'Вычислительная мощность',
        conditions: [
          {
            id: 'has_home_computer', 
            type: 'building', 
            targetId: 'homeComputer', 
            targetValue: 1, 
            operator: 'gte',
            description: 'Иметь хотя бы один домашний компьютер'
          }
        ],
        autoUnlock: true,
        influencesOthers: false
      });
    }
    
    return (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pb-4">
        {allItems.map((item) => {
          const isUnlocked = isItemUnlocked(item.id);
          const allConditionsMet = item.conditions.length === 0 || 
            item.conditions.every(condition => checkConditionMet(condition));
          
          return (
            <Card key={item.id} className={`border ${isUnlocked ? 'bg-green-50' : 'bg-white'}`}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name || item.id}</span>
                      <Badge variant={isUnlocked ? "secondary" : "outline"} className="text-xs">
                        {isUnlocked ? "Разблокировано" : "Заблокировано"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    
                    {item.conditions.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-500">Условия разблокировки:</div>
                        {item.conditions.map((condition, idx) => {
                          const isConditionMet = checkConditionMet(condition);
                          const currentValue = getTargetCurrentValue(condition);
                          
                          return (
                            <div 
                              key={idx} 
                              className={`text-xs pl-2 border-l-2 ${
                                isConditionMet ? 'border-green-500 text-green-700' : 'border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {isConditionMet ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <div className="h-3 w-3" />
                                )}
                                <span>{condition.description || `${condition.targetId} ${formatOperator(condition.operator)} ${condition.targetValue}`}</span>
                              </div>
                              <div className="text-[10px] text-gray-500 ml-3">
                                Текущее значение: {String(currentValue)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-500">Нет условий для разблокировки</div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleForceUnlock(item.id)}
                    disabled={isUnlocked}
                  >
                    {isUnlocked ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Unlock className="h-3 w-3 mr-1" />
                    )}
                    {isUnlocked ? "Разблокировано" : "Разблокировать"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-6 text-xs">
          <Info className="h-3 w-3" />
          Проверка разблокировок
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-lg">
        <SheetHeader>
          <SheetTitle>Проверка разблокировок</SheetTitle>
          <SheetDescription>
            Отладка и управление разблокировками игры
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={handleCheckAllUnlocks}
          >
            Проверить все разблокировки
          </Button>
          
          <div className="space-y-4">
            {renderUnlockableItemsList()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UnlockStatusPopup;
