
import React from "react";
import { Button } from "@/components/ui/button";
import { Bitcoin, ArrowRightLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/utils/helpers";

interface ExchangeBtcButtonProps {
  onClick: () => void;
  disabled: boolean;
  btcAmount: number;
  exchangeRate: number;
  fee: number;
}

const ExchangeBtcButton: React.FC<ExchangeBtcButtonProps> = ({
  onClick,
  disabled,
  btcAmount,
  exchangeRate,
  fee
}) => {
  // Рассчитываем, сколько USDT получит игрок
  const usdtAmount = btcAmount * exchangeRate * (1 - fee);
  
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
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Bitcoin className="mr-1 h-4 w-4" />
                <ArrowRightLeft className="mr-1 h-3 w-3" />
                <span>Обменять BTC</span>
              </div>
              <span className="text-xs">{formatNumber(exchangeRate)} USDT/BTC</span>
            </div>
          </Button>
        </TooltipTrigger>
        {disabled ? (
          <TooltipContent>
            <p>У вас нет BTC для обмена</p>
          </TooltipContent>
        ) : (
          <TooltipContent>
            <p>Обменять {btcAmount.toFixed(5)} BTC на {Math.floor(usdtAmount * 100) / 100} USDT</p>
            <p className="text-xs text-muted-foreground">Комиссия: {fee * 100}%</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExchangeBtcButton;
