
import React from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExchangeBtcButtonProps {
  onClick: () => void;
  disabled: boolean;
  currentRate: number;
}

export const ExchangeBtcButton: React.FC<ExchangeBtcButtonProps> = ({ 
  onClick, 
  disabled,
  currentRate
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
            <Bitcoin className="mr-2 h-4 w-4" />
            Обменять BTC
          </Button>
        </TooltipTrigger>
        {disabled ? (
          <TooltipContent>
            <p>У вас нет BTC для обмена</p>
          </TooltipContent>
        ) : (
          <TooltipContent>
            <p>Курс обмена: 1 BTC = {currentRate.toLocaleString()} USDT</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExchangeBtcButton;
