
import React from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApplyKnowledgeButtonProps {
  onClick: () => void;
  disabled: boolean;
  knowledgeEfficiencyBonus?: number;
  className?: string;
}

export const ApplyKnowledgeButton: React.FC<ApplyKnowledgeButtonProps> = ({ 
  onClick, 
  disabled,
  knowledgeEfficiencyBonus = 0,
  className = ""
}) => {
  // Рассчитываем, сколько USDT будет получено при применении знаний
  const usdtReward = Math.floor(1 * (1 + knowledgeEfficiencyBonus));
  const bonusText = knowledgeEfficiencyBonus > 0 
    ? `+${knowledgeEfficiencyBonus * 100}% к эффективности`
    : '';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={`w-full ${className}`}
            variant={disabled ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            Обменять 10 знаний на {usdtReward} USDT
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>Требуется 10 знаний</p>
          </TooltipContent>
        )}
        {!disabled && bonusText && (
          <TooltipContent>
            <p>{bonusText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApplyKnowledgeButton;
