
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
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
  
  // Эффект для отправки сообщения о появлении кнопки "Практиковаться" только один раз
  useEffect(() => {
    if (state.unlocks.practice && !practiceMessageSent) {
      onAddEvent("Функция 'Практика' разблокирована", "info");
      onAddEvent("Накопите 10 USDT, чтобы начать практиковаться и включить фоновое накопление знаний", "info");
      setPracticeMessageSent(true);
    }
  }, [state.unlocks.practice, onAddEvent, practiceMessageSent]);
  
  // Обработка клика по кнопке "Изучить крипту"
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    // Если это третий клик и кнопка "Применить знания" еще не разблокирована
    if (state.resources.knowledge.value === 2 && !state.unlocks.applyKnowledge) {
      onAddEvent("Изучите еще немного, и вы сможете применить свои знания!", "info");
    }
  };
  
  // Обработка клика по кнопке "Применить знания"
  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
  };
  
  // Обработка клика по кнопке "Практиковаться"
  const handlePractice = () => {
    // Рассчитываем текущую стоимость с учетом уже купленных уровней практики
    const building = state.buildings.practice;
    const currentCost = Math.floor(building.cost.usdt * Math.pow(building.costMultiplier, building.count));
    
    console.log(`Нажата кнопка Практиковаться. USDT: ${state.resources.usdt.value}, Требуется: ${currentCost}`);
    
    if (state.resources.usdt.value < currentCost) {
      onAddEvent(`Недостаточно USDT! Требуется ${currentCost} единиц.`, "error");
      return;
    }
    
    // Покупаем здание practice
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
    onAddEvent(`Вы повысили уровень практики до ${building.count + 1}! Скорость накопления знаний увеличена.`, "success");
  };
  
  // Обработка клика по кнопке "Майнить USDT"
  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
  };
  
  // Функция для проверки доступности кнопки
  const isButtonEnabled = (requiredResource: string, amount: number): boolean => {
    return state.resources[requiredResource] && state.resources[requiredResource].value >= amount;
  };
  
  // Рассчитываем текущую стоимость практики
  const practiceCurrentCost = state.buildings.practice 
    ? Math.floor(state.buildings.practice.cost.usdt * Math.pow(state.buildings.practice.costMultiplier, state.buildings.practice.count)) 
    : 10;
  
  // Получаем текущий уровень практики
  const practiceCurrentLevel = state.buildings.practice ? state.buildings.practice.count : 0;
  
  // Проверка, есть ли автомайнер, чтобы скрыть кнопку майнинга
  const hasAutoMiner = state.buildings.autoMiner.count > 0;
  
  return (
    <div className="space-y-2 mt-2">
      {/* Всегда показываем кнопку изучения */}
      <div>
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
      
      {/* Показываем кнопку применения знаний, если она разблокирована */}
      {state.unlocks.applyKnowledge && (
        <div>
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
      )}
      
      {/* Показываем кнопку практики, если она разблокирована */}
      {state.unlocks.practice && (
        <div>
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
      )}
      
      {/* Показываем кнопку майнинга, если разблокирована вычислительная мощность и нет автомайнера */}
      {state.resources.computingPower.unlocked && !hasAutoMiner && (
        <div>
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
      )}
    </div>
  );
};

export default ActionButtons;
