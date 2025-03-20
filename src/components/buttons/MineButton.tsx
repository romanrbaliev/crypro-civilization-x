
import React from "react";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MineButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

export const MineButton: React.FC<MineButtonProps> = ({ 
  onClick, 
  disabled,
  className = ""
}) => {
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
            <Cpu className="mr-2 h-4 w-4" />
            Майнить USDT
          </Button>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>Требуется 50 вычислительной мощности</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default MineButton;
