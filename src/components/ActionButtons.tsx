
import React, { useEffect, useState } from "react";
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
    console.log("Нажата кнопка Практиковаться. USDT:", state.resources.usdt.value);
    
    if (state.resources.usdt.value < 10) {
      onAddEvent("Недостаточно USDT! Требуется 10 единиц.", "error");
      return;
    }
    
    if (state.buildings.practice.count > 0) {
      onAddEvent("Вы уже практикуетесь!", "info");
      return;
    }
    
    // Покупаем здание practice
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
  };
  
  // Функция для проверки доступности кнопки
  const isButtonEnabled = (requiredResource: string, amount: number): boolean => {
    return state.resources[requiredResource] && state.resources[requiredResource].value >= amount;
  };
  
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
                  variant={isButtonEnabled("usdt", 10) ? "default" : "outline"}
                  size="sm"
                  disabled={!isButtonEnabled("usdt", 10) || state.buildings.practice.count > 0}
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
              {state.buildings.practice.count > 0 && (
                <TooltipContent>
                  <p>Вы уже практикуетесь</p>
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
