
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/hooks/useGame";
import {
  Brain,
  MousePointerClick,
  Cpu,
  BookOpen
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  onAddEvent?: (message: string, type?: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddEvent = () => {} }) => {
  const { state, dispatch } = useGame();
  const [practiceMessageSent, setPracticeMessageSent] = useState(false);
  
  useEffect(() => {
    if (state.unlocks.practice && !practiceMessageSent) {
      onAddEvent("Функция 'Практика' разблокирована", "info");
      onAddEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      setPracticeMessageSent(true);
    }
  }, [state.unlocks.practice, onAddEvent, practiceMessageSent]);
  
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    if (state.resources.knowledge.value === 2 && !state.unlocks.applyKnowledge) {
      onAddEvent("Изучите еще немного, и вы сможете применить свои знания!", "info");
    }
  };
  
  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
  };
  
  const handlePractice = () => {
    // Здесь была проблема - неправильно получали текущую стоимость
    // Исправляем и добавляем больше логов для диагностики
    const practiceBuilding = state.buildings.practice;
    if (!practiceBuilding) {
      console.error("Ошибка: здание practice не найдено в state.buildings");
      onAddEvent("Произошла ошибка при попытке практиковаться", "error");
      return;
    }
    
    // Правильный расчет стоимости согласно формуле
    const currentCost = Math.floor(practiceBuilding.cost.usdt * Math.pow(practiceBuilding.costMultiplier, practiceBuilding.count));
    
    console.log(`Нажата кнопка Практиковаться. USDT: ${state.resources.usdt.value}, Требуется: ${currentCost}`);
    console.log(`Информация о здании: уровень=${practiceBuilding.count}, множитель=${practiceBuilding.costMultiplier}`);
    
    if (state.resources.usdt.value < currentCost) {
      onAddEvent(`Недостаточно USDT! Требуется ${currentCost} единиц.`, "error");
      return;
    }
    
    // Вызываем action покупки здания
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
    onAddEvent(`Вы повысили уровень практики до ${practiceBuilding.count + 1}! Скорость накопления знаний увеличена.`, "success");
  };
  
  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };
  
  const isButtonEnabled = (requiredResource: string, amount: number): boolean => {
    return state.resources[requiredResource] && state.resources[requiredResource].value >= amount;
  };
  
  // Исправляем расчет текущей стоимости практики
  const practiceCurrentCost = state.buildings.practice 
    ? Math.floor(state.buildings.practice.cost.usdt * Math.pow(state.buildings.practice.costMultiplier, state.buildings.practice.count)) 
    : 10;
  
  const practiceCurrentLevel = state.buildings.practice ? state.buildings.practice.count : 0;
  
  const hasAutoMiner = state.buildings.autoMiner && state.buildings.autoMiner.count > 0;
  
  // Создаем кнопки в обратном порядке - основная кнопка будет последней в массиве
  const buttons = [];
  
  // Кнопка майнинга (если она доступна и нет автомайнера)
  if (state.resources.computingPower.unlocked && !hasAutoMiner) {
    buttons.push(
      <div key="mine">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleMineClick}
                className="w-full"
                variant={isButtonEnabled("computingPower", 50) ? "default" : "outline"}
                size="sm"
                disabled={!isButtonEnabled("computingPower", 50)}
              >
                <Cpu className="mr-2 h-4 w-4" />
                Майнить USDT
              </Button>
            </TooltipTrigger>
            {!isButtonEnabled("computingPower", 50) && (
              <TooltipContent>
                <p>Требуется 50 вычислительной мощности</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  // Кнопка практики (если доступна)
  if (state.unlocks.practice) {
    buttons.push(
      <div key="practice">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePractice}
                className="w-full"
                variant={isButtonEnabled("usdt", practiceCurrentCost) ? "default" : "outline"}
                size="sm"
                disabled={!isButtonEnabled("usdt", practiceCurrentCost)}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Практиковаться ({practiceCurrentLevel})
              </Button>
            </TooltipTrigger>
            {!isButtonEnabled("usdt", practiceCurrentCost) && (
              <TooltipContent>
                <p>Требуется {practiceCurrentCost} USDT</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  // Кнопка применения знаний (если доступна)
  if (state.unlocks.applyKnowledge) {
    buttons.push(
      <div key="apply">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleApplyKnowledge}
                className="w-full"
                variant={isButtonEnabled("knowledge", 10) ? "default" : "outline"}
                size="sm"
                disabled={!isButtonEnabled("knowledge", 10)}
              >
                <MousePointerClick className="mr-2 h-4 w-4" />
                Применить знания
              </Button>
            </TooltipTrigger>
            {!isButtonEnabled("knowledge", 10) && (
              <TooltipContent>
                <p>Требуется 10 знаний о крипте</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  // Добавляем основную кнопку в конец
  buttons.push(
    <div key="learn">
      <Button
        onClick={handleLearnClick}
        className="w-full"
        variant="default"
        size="sm"
      >
        <Brain className="mr-2 h-4 w-4" />
        Изучить крипту
      </Button>
    </div>
  );
  
  return (
    <div className="space-y-2 mt-2">
      {buttons}
    </div>
  );
};

export default ActionButtons;
