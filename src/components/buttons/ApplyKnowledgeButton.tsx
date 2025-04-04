
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
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={`w-full border-gray-200 ${disabled ? 'text-gray-400' : 'text-gray-900'} ${className}`}
            variant="outline"
            size="sm"
            disabled={disabled}
          >
            Применить знания
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>Требуется 10 знаний</p>
          </TooltipContent>
        )}
        {!disabled && knowledgeEfficiencyBonus > 0 && (
          <TooltipContent>
            <p>+{knowledgeEfficiencyBonus * 100}% к эффективности</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApplyKnowledgeButton;
