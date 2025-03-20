
import React from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/helpers";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRightLeft } from "lucide-react";

interface ExchangeBtcButtonProps {
  onClick: () => void;
  disabled: boolean;
  currentRate: number;
  className?: string;
}

const ExchangeBtcButton: React.FC<ExchangeBtcButtonProps> = ({ 
  onClick, 
  disabled, 
  currentRate,
  className = "" 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={className}
            variant={disabled ? "outline" : "default"}
            size="sm"
            disabled={disabled}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Обменять BTC
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Курс: 1 BTC = {formatNumber(currentRate)} USDT</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExchangeBtcButton;
