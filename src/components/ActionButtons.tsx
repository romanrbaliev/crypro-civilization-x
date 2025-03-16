
import React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import {
  Brain,
  MousePointerClick,
  Cpu,
  BarChart,
  Activity,
  FlaskConical,
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
  
  // Обработка клика по кнопке "Изучить крипту"
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
    
    // Проверка для разблокировки кнопки "Применить знания"
    if (state.resources.knowledge.value >= 9 && !state.unlocks.applyKnowledge) {
      dispatch({ type: "UNLOCK_FEATURE", payload: { featureId: "applyKnowledge" } });
      onAddEvent("Открыта новая функция: Применить знания", "info");
    }
  };
  
  // Обработка клика по кнопке "Применить знания"
  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
    dispatch({ type: "INCREMENT_COUNTER", payload: { counterId: "applyKnowledge" } });
    
    // Проверяем количество применений знаний
    if (state.counters?.applyKnowledge === 0) {
      // Первое применение знаний
      dispatch({ type: "UNLOCK_RESOURCE", payload: { resourceId: "usdt" } });
      onAddEvent("Вы применили свои знания и получили 1 USDT!", "success");
    } else if (state.counters?.applyKnowledge === 1) {
      // Только при втором применении знаний разблокируем практику
      dispatch({ 
        type: "SET_BUILDING_UNLOCKED", 
        payload: { buildingId: "practice", unlocked: true } 
      });
      onAddEvent("После применения знаний открыта функция 'Практика'", "info");
    }
  };
  
  // Обработка клика по кнопке "Майнить вычислительную мощность"
  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
    
    // Проверяем, первый ли это майнинг
    if (state.counters.mining === 0) {
      onAddEvent("Вы успешно сконвертировали вычислительную мощность в 5 USDT!", "success");
    }
  };
  
  // Функция для проверки доступности кнопки
  const isButtonEnabled = (requiredResource: string, amount: number): boolean => {
    return state.resources[requiredResource] && state.resources[requiredResource].value >= amount;
  };
  
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
      
      {/* Показываем кнопку майнинга, если разблокирована вычислительная мощность */}
      {state.resources.computingPower.unlocked && (
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
