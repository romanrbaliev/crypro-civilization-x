
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ВАЖНО: Этот компонент больше не используется, т.к. Практика теперь
// отображается только как здание в разделе Оборудование
// Компонент сохранен для обратной совместимости, но не используется в интерфейсе

interface PracticeButtonProps {
  onClick: () => void;
  disabled: boolean;
  level: number;
  cost: number;
}

export const PracticeButton: React.FC<PracticeButtonProps> = ({ 
  onClick, 
  disabled,
  level,
  cost
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="w-full"
            variant={disabled ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Практиковаться ({level})
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>Требуется {cost} USDT</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default PracticeButton;
