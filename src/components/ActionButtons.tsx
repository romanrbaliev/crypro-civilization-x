
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
  
  // Обработка клика по кнопке "Изучить крипту"
  const handleLearnClick = () => {
    dispatch({ type: "INCREMENT_RESOURCE", payload: { resourceId: "knowledge", amount: 1 } });
  };
  
  // Обработка клика по кнопке "Применить знания"
  const handleApplyKnowledge = () => {
    if (state.resources.knowledge.value < 10) {
      onAddEvent("Недостаточно знаний! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "APPLY_KNOWLEDGE" });
    onAddEvent("Вы применили знания и получили 1 USDT", "success");
  };
  
  // Обработка клика по кнопке "Практиковаться"
  const handlePractice = () => {
    if (state.resources.usdt.value < 10) {
      onAddEvent("Недостаточно USDT! Требуется 10 единиц.", "error");
      return;
    }
    
    dispatch({ type: "PURCHASE_BUILDING", payload: { buildingId: "practice" } });
    onAddEvent("Вы начали практиковаться! Теперь знания будут накапливаться автоматически.", "success");
  };
  
  // Обработка клика по кнопке "Майнить вычислительную мощность"
  const handleMineClick = () => {
    if (state.resources.computingPower.value < 50) {
      onAddEvent("Недостаточно вычислительной мощности! Требуется 50 единиц.", "error");
      return;
    }
    
    dispatch({ type: "MINE_COMPUTING_POWER" });
    onAddEvent("Вы успешно добыли 5 USDT используя вычислительную мощность!", "success");
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
      
      {/* Показываем кнопку практики, если она разблокирована */}
      {state.unlocks.practice && (
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handlePractice}
                  className="w-full"
                  variant={isButtonEnabled("usdt", 10) ? "default" : "outline"}
                  size="sm"
                  disabled={!isButtonEnabled("usdt", 10)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Практиковаться
                </Button>
              </TooltipTrigger>
              {!isButtonEnabled("usdt", 10) && (
                <TooltipContent>
                  <p>Требуется 10 USDT</p>
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
