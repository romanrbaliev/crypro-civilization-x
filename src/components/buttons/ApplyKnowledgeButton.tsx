
import React from "react";
import { Button } from "@/components/ui/button";
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
  knowledgeValue?: number;
  applyAll?: boolean;
}

export const ApplyKnowledgeButton: React.FC<ApplyKnowledgeButtonProps> = ({ 
  onClick, 
  disabled,
  knowledgeEfficiencyBonus = 0,
  className = "",
  knowledgeValue = 0,
  applyAll = false
}) => {
  const buttonText = "Применить знания";
  
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
            {buttonText}
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
