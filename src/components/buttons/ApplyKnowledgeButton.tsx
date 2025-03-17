
import React from "react";
import { Button } from "@/components/ui/button";
import { MousePointerClick } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApplyKnowledgeButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ApplyKnowledgeButton: React.FC<ApplyKnowledgeButtonProps> = ({ 
  onClick, 
  disabled 
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
            <MousePointerClick className="mr-2 h-4 w-4" />
            Применить знания
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>Требуется 10 знаний о крипте</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApplyKnowledgeButton;
