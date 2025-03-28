
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
  // Текст кнопки меняется в зависимости от режима, но без информации о количестве
  const buttonText = applyAll
    ? "Применить все знания"
    : "Применить знания";
  
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
            {buttonText}
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>{applyAll ? "Требуется хотя бы 10 знаний" : "Требуется 10 знаний"}</p>
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
